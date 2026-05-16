"""
MedTrustX Appointments Service — Event Publisher

Publishes appointment lifecycle events to Redpanda/Kafka.

Events:
  APPOINTMENT_CREATED
  APPOINTMENT_CANCELLED
  APPOINTMENT_RESCHEDULED
  SLOT_BOOKED
  QUEUE_UPDATED
"""
import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import UUID

import structlog
from aiokafka import AIOKafkaProducer

from src.config import settings

logger = structlog.get_logger()

_producer: Optional[AIOKafkaProducer] = None
TOPIC = "medtrust.appointment.events"


class UUIDEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        if isinstance(obj, UUID):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


async def init_producer() -> None:
    global _producer
    try:
        _producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BROKERS,
            value_serializer=lambda v: json.dumps(v, cls=UUIDEncoder).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            acks="all",
            enable_idempotence=True,
            max_request_size=1_048_576,
        )
        await _producer.start()
        logger.info("kafka_producer_started", brokers=settings.KAFKA_BROKERS)
    except Exception as exc:
        logger.error("kafka_producer_init_failed", error=str(exc))
        _producer = None


async def close_producer() -> None:
    global _producer
    if _producer:
        await _producer.stop()
        _producer = None
        logger.info("kafka_producer_stopped")


async def publish_event(
    event_type: str,
    tenant_id: UUID,
    patient_id: Optional[UUID] = None,
    payload: Optional[Dict[str, Any]] = None,
) -> None:
    event = {
        "event": event_type,
        "tenant_id": tenant_id,
        "timestamp": datetime.now(timezone.utc),
        "service": settings.SERVICE_NAME,
        "version": "1.0",
    }
    if patient_id:
        event["patient_id"] = patient_id
    if payload:
        event["data"] = payload

    if _producer is None:
        logger.warning(
            "kafka_producer_unavailable",
            event_type=event_type,
        )
        return

    try:
        routing_key = str(patient_id) if patient_id else str(tenant_id)
        await _producer.send_and_wait(
            topic=TOPIC,
            key=routing_key,
            value=event,
        )
        logger.info(
            "event_published",
            event_type=event_type,
        )
    except Exception as exc:
        logger.error(
            "event_publish_failed",
            event_type=event_type,
            error=str(exc),
        )
