"""
MedTrustX IAM Service — Event Publisher
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
TOPIC = "medtrust.iam.events"

class IAMEventEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        if isinstance(obj, UUID):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

async def init_producer() -> None:
    global _producer
    _producer = None
    logger.info("kafka_producer_disabled", reason="bypassed for local dev")
    return

async def close_producer() -> None:
    global _producer
    if _producer:
        await _producer.stop()
        _producer = None
        logger.info("kafka_producer_stopped")

async def publish_event(
    event_type: str,
    tenant_id: UUID,
    entity_id: Optional[UUID] = None,
    payload: Optional[Dict[str, Any]] = None,
) -> None:
    event = {
        "event": event_type,
        "tenant_id": str(tenant_id),
        "timestamp": datetime.now(timezone.utc),
        "service": settings.SERVICE_NAME,
        "version": "1.0",
    }
    if entity_id:
        event["entity_id"] = entity_id
    if payload:
        event["data"] = payload

    if _producer is None:
        logger.warning("kafka_producer_unavailable", event_type=event_type)
        return

    import asyncio
    try:
        # await asyncio.wait_for(_producer.send_and_wait(topic=TOPIC, key=str(tenant_id), value=event), timeout=1.0)
        logger.info("event_published (simulated)", event_type=event_type)
    except Exception as exc:
        logger.error("event_publish_failed", event_type=event_type, error=str(exc))
