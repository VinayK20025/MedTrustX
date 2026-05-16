"""
Vitals Processing Service.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
import json
from opentelemetry import trace
import math
from datetime import datetime
import httpx

from app.db.repositories.vitals_repo import VitalsRepository
from app.config import settings

tracer = trace.get_tracer(__name__)

class VitalsProcessor:
    def __init__(self, session: AsyncSession, redis_client):
        self.repo = VitalsRepository(session)
        self.redis = redis_client
        self.ai_url = settings.ai_service_url

    async def _compute_zscore(self, tenant_id: str, patient_id: str, vital_type: str, new_value: float) -> float:
        history = await self.repo.get_recent_vitals(tenant_id, patient_id, vital_type, days=30)
        values = [v["value"] for v in history]
        if len(values) < 2:
            return 0.0
            
        mean = sum(values) / len(values)
        variance = sum((x - mean) ** 2 for x in values) / len(values)
        std_dev = math.sqrt(variance)
        
        if std_dev == 0:
            return 0.0
            
        return (new_value - mean) / std_dev

    async def ingest(self, tenant_id: str, patient_id: str, vitals: List[Dict[str, Any]]) -> Dict[str, Any]:
        with tracer.start_as_current_span("vitals.ingest"):
            results = await self.repo.ingest_vitals(tenant_id, patient_id, vitals)
            anomalies = []
            
            for res in results:
                vital_type = res["vital_type"]
                val = float(res["value"])
                
                z_score = await self._compute_zscore(tenant_id, patient_id, vital_type, val)
                
                is_anomaly = abs(z_score) > 2.5
                
                event = {
                    "event": "vitals_update",
                    "patient_id": patient_id,
                    "vital_type": vital_type,
                    "value": val,
                    "unit": res["unit"],
                    "recorded_at": res["recorded_at"].isoformat(),
                    "z_score": z_score,
                    "anomaly": is_anomaly
                }
                
                await self.redis.publish(f"medtrust:clinical:vitals:{patient_id}", json.dumps(event))
                
                if is_anomaly:
                    anomalies.append(event)
                    await self.redis.publish("medtrust:clinical:alerts", json.dumps(event))
                    
                    try:
                        async with httpx.AsyncClient() as client:
                            await client.post(f"{self.ai_url}/api/ai/vitals-anomaly", json=event)
                    except Exception:
                        pass
                        
            return {
                "ingested_count": len(results),
                "anomalies": anomalies
            }
