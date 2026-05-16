"""
Result Processor Service.
"""
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace
import uuid
from datetime import datetime
import json

from app.db.repositories.order_repo import OrderRepository
from app.services.ai_bridge import AIBridge

tracer = trace.get_tracer(__name__)

class ResultProcessor:
    def __init__(self, session: AsyncSession, redis_client):
        self.repo = OrderRepository(session)
        self.redis = redis_client
        self.ai_bridge = AIBridge()

    async def record_result(self, tenant_id: str, order_id: str, payload: Dict[str, Any], patient_id: str) -> Dict[str, Any]:
        with tracer.start_as_current_span("result.record"):
            data = payload.copy()
            data["id"] = str(uuid.uuid4())
            data["tenant_id"] = tenant_id
            data["order_id"] = order_id
            data["patient_id"] = patient_id
            data["resulted_at"] = datetime.utcnow()
            
            ref_range = data.pop("reference_range", "")
            if "-" in ref_range:
                try:
                    low, high = ref_range.split("-")
                    data["reference_range_low"] = float(low.strip())
                    data["reference_range_high"] = float(high.strip())
                except ValueError:
                    pass
                    
            result = await self.repo.record_result(tenant_id, data)
            
            if data.get("abnormal_flag"):
                alert = {
                    "event": "abnormal_result",
                    "patient_id": patient_id,
                    "order_id": order_id,
                    "loinc_code": data["loinc_code"],
                    "value": data["result_value"]
                }
                await self.redis.publish("medtrust:clinical:alerts", json.dumps(alert))
                await self.ai_bridge.analyze_critical_result(alert)
                
            return result
