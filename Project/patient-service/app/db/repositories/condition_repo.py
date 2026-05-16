"""
Condition Repository.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class ConditionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_patient_conditions(self, tenant_id: str, patient_id: str) -> List[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        stmt = text("""
            SELECT * FROM conditions 
            WHERE patient_id = :patient_id 
              AND tenant_id = :tenant_id
            ORDER BY onset_date DESC
        """)
        result = await self.session.execute(stmt, {"patient_id": patient_id, "tenant_id": tenant_id})
        return [dict(row) for row in result.mappings().all()]
