"""
Medication Repository.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class MedicationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_medication(self, tenant_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        
        cols = ", ".join(data.keys())
        vals = ", ".join([f":{k}" for k in data.keys()])
        
        stmt = text(f"""
            INSERT INTO medications ({cols})
            VALUES ({vals})
            RETURNING *
        """)
        
        result = await self.session.execute(stmt, data)
        row = result.mappings().first()
        await self.session.commit()
        return dict(row) if row else {}

    async def get_patient_medications(self, tenant_id: str, patient_id: str, status: Optional[str] = "active") -> List[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        
        query = "SELECT * FROM medications WHERE patient_id = :patient_id AND tenant_id = :tenant_id"
        params = {"patient_id": patient_id, "tenant_id": tenant_id}
        
        if status and status != "all":
            query += " AND status = :status"
            params["status"] = status
            
        query += " ORDER BY prescribed_at DESC"
        
        stmt = text(query)
        result = await self.session.execute(stmt, params)
        return [dict(row) for row in result.mappings().all()]
