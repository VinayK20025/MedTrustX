"""
MedTrustX DB Integration — Outbox Pattern (§4 + §5)

Transactional outbox guaranteeing DB + Event consistency.

Flow:
  1. Business write + OutboxEvent inserted in SAME transaction
  2. Worker polls pending events
  3. Publishes to Kafka
  4. Marks as 'sent'

This prevents:
  - Lost events (crash after DB write, before Kafka publish)
  - Duplicate processing (idempotency keys)
  - Partial writes (atomic transaction)
"""
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import DateTime, Index, String, Text, text, select, update
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
import structlog

logger = structlog.get_logger()


class OutboxBase(DeclarativeBase):
    """Separate declarative base for outbox — can coexist in any service schema."""
    pass


class OutboxEvent(OutboxBase):
    """
    §5 — Transactional outbox event record.
    One table per service, same database as business data.
    """
    __tablename__ = "outbox_events"
    __table_args__ = (
        Index("ix_outbox_status_created", "status", "created_at"),
        Index("ix_outbox_tenant", "tenant_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    aggregate_type: Mapped[str] = mapped_column(String(100), nullable=False)    # e.g. "Patient", "Encounter"
    aggregate_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    idempotency_key: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending | sent | failed
    retry_count: Mapped[int] = mapped_column(default=0)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


async def outbox_publish(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    event_type: str,
    aggregate_type: str,
    aggregate_id: uuid.UUID,
    payload: Dict[str, Any],
    idempotency_key: Optional[str] = None,
) -> OutboxEvent:
    """
    §4 — Insert outbox event WITHIN the same transaction as business write.

    Usage:
        async with session.begin():
            patient = Patient(...)
            session.add(patient)
            await outbox_publish(session, tid, "PATIENT_CREATED", "Patient", patient.id, {...})
    """
    if idempotency_key is None:
        idempotency_key = f"{event_type}:{aggregate_id}:{datetime.now(timezone.utc).isoformat()}"

    event = OutboxEvent(
        tenant_id=tenant_id,
        event_type=event_type,
        aggregate_type=aggregate_type,
        aggregate_id=aggregate_id,
        payload=payload,
        idempotency_key=idempotency_key,
    )
    session.add(event)
    await session.flush()
    logger.debug("outbox_event_created", event_type=event_type, aggregate_id=str(aggregate_id))
    return event


class OutboxWorker:
    """
    §5 — Background worker that polls outbox and publishes to Kafka.

    Runs as a separate process or async task per service.
    """

    def __init__(self, session_factory, kafka_producer, topic: str, batch_size: int = 50):
        self._session_factory = session_factory
        self._producer = kafka_producer
        self._topic = topic
        self._batch_size = batch_size

    async def poll_and_publish(self) -> int:
        """Process one batch of pending outbox events. Returns count published."""
        async with self._session_factory() as session:
            result = await session.execute(
                select(OutboxEvent)
                .where(OutboxEvent.status == "pending")
                .order_by(OutboxEvent.created_at.asc())
                .limit(self._batch_size)
                .with_for_update(skip_locked=True)  # Prevents duplicate processing
            )
            events: List[OutboxEvent] = list(result.scalars().all())

            if not events:
                return 0

            published = 0
            for evt in events:
                try:
                    kafka_payload = {
                        "event": evt.event_type,
                        "tenant_id": str(evt.tenant_id),
                        "aggregate_type": evt.aggregate_type,
                        "aggregate_id": str(evt.aggregate_id),
                        "data": evt.payload,
                        "idempotency_key": evt.idempotency_key,
                        "timestamp": evt.created_at.isoformat(),
                    }
                    await self._producer.send_and_wait(
                        topic=self._topic,
                        key=str(evt.tenant_id).encode("utf-8"),
                        value=json.dumps(kafka_payload, default=str).encode("utf-8"),
                    )
                    evt.status = "sent"
                    evt.sent_at = datetime.now(timezone.utc)
                    published += 1
                except Exception as exc:
                    evt.retry_count += 1
                    evt.error_message = str(exc)[:500]
                    if evt.retry_count >= 5:
                        evt.status = "failed"
                    logger.error("outbox_publish_failed", event_id=str(evt.id), error=str(exc))

            await session.commit()
            logger.info("outbox_batch_processed", total=len(events), published=published)
            return published
