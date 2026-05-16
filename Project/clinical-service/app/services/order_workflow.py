"""
Clinical Order Workflow.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
import uuid
from datetime import datetime
import json

from app.db.repositories.order_repo import OrderRepository

tracer = trace.get_tracer(__name__)

class OrderWorkflow:
    def __init__(self, session: AsyncSession, redis_client):
        self.repo = OrderRepository(session)
        self.redis = redis_client

    async def create_order(self, tenant_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        with tracer.start_as_current_span("order.create"):
            data = payload.copy()
            data["id"] = str(uuid.uuid4())
            data["tenant_id"] = tenant_id
            data["status"] = "active"
            data["ordered_at"] = datetime.utcnow()
            
            order_type = data.get("order_type")
            if order_type == "lab":
                data["coding_system"] = "LOINC"
            elif order_type in ["imaging", "procedure"]:
                data["coding_system"] = "SNOMED"
            else:
                data["coding_system"] = "LOCAL"
                
            order = await self.repo.create_order(tenant_id, data)
            
            await self.redis.publish("medtrust:clinical:orders", json.dumps({
                "event": "order_created",
                "order_id": order["id"],
                "order_type": order["order_type"],
                "patient_id": order["patient_id"]
            }))
            
            return order

    async def list_orders(self, tenant_id: str, patient_id: str, order_type: str = None, status: str = None) -> List[Dict[str, Any]]:
        return await self.repo.get_patient_orders(tenant_id, patient_id, order_type, status)
