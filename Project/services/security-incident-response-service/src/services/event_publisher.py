"""
MedTrustX Security Incident Response Service — Event Publisher
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
TOPIC = "medtrust.securityincident.events"

class IncidentEventEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        if isinstance(obj, UUID): return str(obj)
        if isinstance(obj, datetime): return obj.isoformat()
        return super().default(obj)

async def init_producer() -> None:
    global _producer
    try:
        _producer = AIOKafkaProducer(bootstrap_servers=settings.KAFKA_BROKERS, value_serializer=lambda v: json.dumps(v, cls=IncidentEventEncoder).encode("utf-8"), key_serializer=lambda k: k.encode("utf-8") if k else None, acks="all", enable_idempotence=True, max_request_size=1_048_576)
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

async def publish_event(event_type: str, tenant_id: UUID, entity_id: Optional[UUID] = None, payload: Optional[Dict[str, Any]] = None) -> None:
    event = {"event": event_type, "tenant_id": str(tenant_id), "timestamp": datetime.now(timezone.utc), "service": settings.SERVICE_NAME, "version": "1.0"}
    if entity_id: event["entity_id"] = entity_id
    if payload: event["data"] = payload
    if _producer is None:
        logger.warning("kafka_producer_unavailable", event_type=event_type)
        return
    try:
        await _producer.send_and_wait(topic=TOPIC, key=str(tenant_id), value=event)
        logger.info("event_published", event_type=event_type)
    except Exception as exc:
        logger.error("event_publish_failed", event_type=event_type, error=str(exc))
