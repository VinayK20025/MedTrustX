"""
Encounter Repository.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class EncounterRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_patient_encounters(self, tenant_id: str, patient_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        stmt = text("""
            SELECT * FROM encounters 
            WHERE patient_id = :patient_id 
              AND tenant_id = :tenant_id
            ORDER BY start_time DESC
            LIMIT :limit
        """)
        result = await self.session.execute(stmt, {"patient_id": patient_id, "tenant_id": tenant_id, "limit": limit})
        return [dict(row) for row in result.mappings().all()]
