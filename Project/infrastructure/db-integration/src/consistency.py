"""
MedTrustX DB Integration — Data Consistency Model (§11)

Eventual consistency utilities for event-driven architecture.
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, String, text, select
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
import structlog

logger = structlog.get_logger()

class ConsistencyBase(DeclarativeBase):
    pass

class EventLog(ConsistencyBase):
    """Idempotency log preventing duplicate event processing."""
    __tablename__ = "processed_events"
    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    event_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    processed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

async def is_event_processed(session: AsyncSession, event_id: str) -> bool:
    result = await session.execute(select(EventLog).where(EventLog.event_id == event_id))
    return result.scalar_one_or_none() is not None

async def mark_event_processed(session: AsyncSession, event_id: str, event_type: str) -> None:
    session.add(EventLog(event_id=event_id, event_type=event_type))
    await session.flush()
