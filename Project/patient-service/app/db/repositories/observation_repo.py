"""
Observation Repository (Vitals).
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class ObservationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_patient_observations(self, tenant_id: str, patient_id: str, days: int = 90) -> List[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        stmt = text("""
            SELECT * FROM observations 
            WHERE patient_id = :patient_id 
              AND tenant_id = :tenant_id
              AND recorded_at >= NOW() - INTERVAL '1 day' * :days
            ORDER BY recorded_at DESC
        """)
        result = await self.session.execute(stmt, {"patient_id": patient_id, "tenant_id": tenant_id, "days": days})
        return [dict(row) for row in result.mappings().all()]
