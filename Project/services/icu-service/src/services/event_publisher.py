"""
MedTrustX ICU Service — Event Publisher

Publishes high-frequency streaming events to Redpanda/Kafka.

Events:
  ICU_PATIENT_ADMITTED
  VITALS_STREAM_RECEIVED
  CRITICAL_ALERT_TRIGGERED
  ALERT_RESOLVED
  DEVICE_DATA_INGESTED
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
TOPIC = "medtrust.icu.events"


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
        # Optimized for high-throughput
        _producer = AIOKafkaProducer(
            bootstrap_servers=settings.KAFKA_BROKERS,
            value_serializer=lambda v: json.dumps(v, cls=UUIDEncoder).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
            acks=1, # Trade absolute durability for lower latency in streaming vitals
            linger_ms=5, # Micro-batching
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
        return # Fail silently on metrics to avoid blocking main thread

    try:
        # Key by patient_id to ensure order of time-series
        routing_key = str(patient_id) if patient_id else str(tenant_id)
        # We don't await the result here for streaming endpoints to minimize latency
        import asyncio
        asyncio.create_task(_producer.send(
            topic=TOPIC,
            key=routing_key.encode("utf-8"),
            value=event,
        ))
    except Exception as exc:
        logger.error(
            "event_publish_failed",
            event_type=event_type,
            error=str(exc),
        )
