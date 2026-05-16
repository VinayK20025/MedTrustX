"""
MedTrustX Patient Service — Event Publisher

Publishes domain events to Redpanda/Kafka for downstream
consumers (clinical-service, billing-service, etc.).

Events:
  PATIENT_CREATED
  PATIENT_UPDATED
  PATIENT_DEACTIVATED
  PATIENT_LINKED_TO_MPI
"""
import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import UUID

import structlog
from aiokafka import AIOKafkaProducer

from src.config import settings

logger = structlog.get_logger()

# ── Global producer instance (initialized at startup) ──────────
_producer: Optional[AIOKafkaProducer] = None

TOPIC = "medtrust.patient.events"


class UUIDEncoder(json.JSONEncoder):
    """JSON encoder that handles UUID and datetime serialization."""

    def default(self, obj: Any) -> Any:
        if isinstance(obj, UUID):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


async def init_producer() -> None:
    """Start Kafka producer. Called during application lifespan startup."""
    global _producer
    try:
        _producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BROKERS,
            value_serializer=lambda v: json.dumps(v, cls=UUIDEncoder).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            acks="all",
            enable_idempotence=True,
            max_request_size=1_048_576,  # 1 MB
            request_timeout_ms=10_000,
            retry_backoff_ms=200,
        )
        await _producer.start()
        logger.info("kafka_producer_started", brokers=settings.KAFKA_BROKERS)
    except Exception as exc:
        logger.error("kafka_producer_init_failed", error=str(exc))
        _producer = None


async def close_producer() -> None:
    """Stop Kafka producer. Called during application lifespan shutdown."""
    global _producer
    if _producer:
        await _producer.stop()
        _producer = None
        logger.info("kafka_producer_stopped")


async def publish_event(
    event_type: str,
    patient_id: UUID,
    tenant_id: UUID,
    payload: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Publish a patient domain event.

    Parameters
    ----------
    event_type : str
        One of: PATIENT_CREATED, PATIENT_UPDATED, PATIENT_DEACTIVATED, PATIENT_LINKED_TO_MPI
    patient_id : UUID
        Patient identifier
    tenant_id : UUID
        Tenant (hospital) identifier
    payload : dict, optional
        Additional event-specific data
    """
    event = {
        "event": event_type,
        "patient_id": patient_id,
        "tenant_id": tenant_id,
        "timestamp": datetime.now(timezone.utc),
        "service": settings.SERVICE_NAME,
        "version": "1.0",
    }
    if payload:
        event["data"] = payload

    if _producer is None:
        # Fail-open in development — log and skip
        logger.warning(
            "kafka_producer_unavailable",
            event_type=event_type,
            patient_id=str(patient_id),
        )
        return

    try:
        # Key by tenant_id for partition affinity — all events for a
        # tenant land in the same partition, ensuring ordering.
        await _producer.send_and_wait(
            topic=TOPIC,
            key=str(tenant_id),
            value=event,
        )
        logger.info(
            "event_published",
            event_type=event_type,
            patient_id=str(patient_id),
            tenant_id=str(tenant_id),
        )
    except Exception as exc:
        logger.error(
            "event_publish_failed",
            event_type=event_type,
            patient_id=str(patient_id),
            error=str(exc),
        )
        # Do not raise — event publishing is best-effort in this design.
        # A production system would use an outbox pattern or DLQ.
