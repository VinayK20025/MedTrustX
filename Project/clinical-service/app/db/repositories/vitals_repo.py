"""
Vitals Repository.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime

class VitalsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def ingest_vitals(self, tenant_id: str, patient_id: str, vitals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        
        results = []
        stmt = text("""
            INSERT INTO observations (patient_id, tenant_id, vital_type, value, unit, recorded_at)
            VALUES (:patient_id, :tenant_id, :vital_type, :value, :unit, :recorded_at)
            RETURNING *
        """)
        
        for vital in vitals:
            params = {
                "patient_id": patient_id,
                "tenant_id": tenant_id,
                "vital_type": vital["type"],
                "value": float(vital["value"]),
                "unit": vital["unit"],
                "recorded_at": vital.get("recorded_at") or datetime.utcnow()
            }
            res = await self.session.execute(stmt, params)
            row = res.mappings().first()
            if row:
                results.append(dict(row))
                
        await self.session.commit()
        return results

    async def get_recent_vitals(self, tenant_id: str, patient_id: str, vital_type: str, days: int = 30) -> List[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        
        stmt = text("""
            SELECT * FROM observations 
            WHERE patient_id = :patient_id 
              AND tenant_id = :tenant_id
              AND vital_type = :vital_type
              AND recorded_at >= NOW() - INTERVAL '1 day' * :days
            ORDER BY recorded_at ASC
        """)
        
        result = await self.session.execute(stmt, {"patient_id": patient_id, "tenant_id": tenant_id, "vital_type": vital_type, "days": days})
        return [dict(row) for row in result.mappings().all()]
