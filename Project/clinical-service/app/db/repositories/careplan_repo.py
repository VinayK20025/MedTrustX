"""
Care Plan Repository.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class CarePlanRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_careplan(self, tenant_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        
        cols = ", ".join(data.keys())
        vals = ", ".join([f":{k}" for k in data.keys()])
        
        stmt = text(f"""
            INSERT INTO careplans ({cols})
            VALUES ({vals})
            RETURNING *
        """)
        
        result = await self.session.execute(stmt, data)
        row = result.mappings().first()
        await self.session.commit()
        return dict(row) if row else {}

    async def get_patient_careplans(self, tenant_id: str, patient_id: str) -> List[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        
        stmt = text("""
            SELECT * FROM careplans 
            WHERE patient_id = :patient_id 
              AND tenant_id = :tenant_id
            ORDER BY start_date DESC
        """)
        
        result = await self.session.execute(stmt, {"patient_id": patient_id, "tenant_id": tenant_id})
        return [dict(row) for row in result.mappings().all()]
