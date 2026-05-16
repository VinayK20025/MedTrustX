"""
MedTrustX Devices & IoMT Service — Event Publisher

Publishes high-frequency telemetry and critical hardware alerts to Kafka.

Events:
  DEVICE_REGISTERED
  DEVICE_ASSIGNED
  TELEMETRY_RECEIVED
  DEVICE_ALERT_TRIGGERED
  DEVICE_ALERT_RESOLVED
"""
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

import structlog
from aiokafka import AIOKafkaProducer

from src.config import settings

logger = structlog.get_logger()

_producer: Optional[AIOKafkaProducer] = None
TOPIC_TELEMETRY = "medtrust.iomt.telemetry"
TOPIC_EVENTS = "medtrust.iomt.events"


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
        # Optimized for high-throughput device streaming
        _producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BROKERS,
            value_serializer=lambda v: json.dumps(v, cls=UUIDEncoder).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            acks=1,  # Lower acks for throughput in telemetry
            linger_ms=5, # Micro-batching
            max_request_size=2_097_152,
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
    device_id: UUID,
    topic: str = TOPIC_EVENTS,
    payload: Optional[Dict[str, Any]] = None,
) -> None:
    event = {
        "event": event_type,
        "tenant_id": tenant_id,
        "device_id": device_id,
        "timestamp": datetime.now(timezone.utc),
        "service": settings.SERVICE_NAME,
    }
    if payload:
        event["data"] = payload

    if _producer is None:
        logger.warning("kafka_producer_unavailable", event_type=event_type)
        return

    try:
        # Key by device_id to ensure order
        await _producer.send_and_wait(
            topic=topic,
            key=str(device_id),
            value=event,
        )
    except Exception as exc:
        logger.error("event_publish_failed", event_type=event_type, error=str(exc))


async def publish_telemetry_batch(
    tenant_id: UUID,
    device_id: UUID,
    patient_id: Optional[UUID],
    batch: List[Dict[str, Any]],
) -> None:
    """Specialized high-throughput publisher for telemetry bundles."""
    if _producer is None:
        return

    event = {
        "event": "TELEMETRY_RECEIVED",
        "tenant_id": tenant_id,
        "device_id": device_id,
        "patient_id": patient_id, # Can be null if device is unassigned but still streaming
        "timestamp": datetime.now(timezone.utc),
        "data": batch,
    }

    try:
        await _producer.send_and_wait(
            topic=TOPIC_TELEMETRY,
            key=str(patient_id) if patient_id else str(device_id),
            value=event,
        )
    except Exception as exc:
        logger.error("telemetry_publish_failed", error=str(exc))
