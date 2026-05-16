"""
Referral Manager Service.
"""
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
import uuid
from datetime import datetime
import json

tracer = trace.get_tracer(__name__)

class ReferralManager:
    def __init__(self, session: AsyncSession, redis_client):
        self.session = session
        self.redis = redis_client

    async def create_referral(self, tenant_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        with tracer.start_as_current_span("referral.create"):
            from app.db.repositories.order_repo import OrderRepository
            repo = OrderRepository(self.session)
            
            data = {
                "id": str(uuid.uuid4()),
                "tenant_id": tenant_id,
                "patient_id": payload["patient_id"],
                "order_type": "referral",
                "order_code": payload["specialty"],
                "coding_system": "SPECIALTY",
                "priority": payload["urgency"],
                "status": "active",
                "ordered_by": payload["referring_doctor_id"],
                "description": payload["reason"],
                "ordered_at": datetime.utcnow()
            }
            
            order = await repo.create_order(tenant_id, data)
            
            await self.redis.publish("medtrust:clinical:orders", json.dumps({
                "event": "referral_created",
                "patient_id": payload["patient_id"],
                "specialty": payload["specialty"],
                "urgency": payload["urgency"]
            }))
            
            return order
