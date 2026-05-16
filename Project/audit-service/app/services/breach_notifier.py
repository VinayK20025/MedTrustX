"""
Breach Notifier Workflow.
"""
from uuid import UUID
from datetime import datetime, timezone
import json
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
from redis.asyncio import Redis

from app.db.repositories.breach_repo import BreachRepository

tracer = trace.get_tracer(__name__)

class BreachNotifier:
    def __init__(self, session: AsyncSession, redis: Redis):
        self.repo = BreachRepository(session)
        self.redis = redis

    async def process_incident(self, incident_id: UUID) -> None:
        """Immediate T+0 Notification"""
        with tracer.start_as_current_span("audit.breach.notify"):
            incident = await self.repo.get_incident(incident_id)
            if not incident:
                return
                
            notification = {
                "event": "breach_alert",
                "incident_id": str(incident_id),
                "severity": incident["severity"],
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            await self.redis.publish("medtrust:breach:alerts:dpo", json.dumps(notification))
            await self.redis.publish("medtrust:breach:alerts:ciso", json.dumps(notification))
            await self.redis.publish("medtrust:audit:stream", json.dumps(notification))

    async def notify_manual(self, incident_id: UUID, notified_by: str, notification_type: str, notes: str) -> None:
        """Manual override notification"""
        with tracer.start_as_current_span("audit.breach.notify_manual"):
            await self.repo.mark_notified(incident_id)
            
            await self.redis.publish("medtrust:breach:incidents", json.dumps({
                "event": "breach_notified",
                "incident_id": str(incident_id),
                "notified_by": notified_by,
                "type": notification_type,
                "notes": notes,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }))
