"""
Patient Repository.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from uuid import UUID

class PatientRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_patient_by_id(self, tenant_id: str, patient_id: str) -> Optional[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        stmt = text("SELECT * FROM patients WHERE id = :id AND tenant_id = :tenant_id")
        result = await self.session.execute(stmt, {"id": patient_id, "tenant_id": tenant_id})
        row = result.mappings().first()
        return dict(row) if row else None

    async def get_patient_by_mrn(self, tenant_id: str, mrn: str) -> Optional[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        stmt = text("SELECT * FROM patients WHERE mrn = :mrn AND tenant_id = :tenant_id")
        result = await self.session.execute(stmt, {"mrn": mrn, "tenant_id": tenant_id})
        row = result.mappings().first()
        return dict(row) if row else None

    async def create_patient(self, tenant_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        cols = ", ".join(data.keys())
        vals = ", ".join([f":{k}" for k in data.keys()])
        
        stmt = text(f"""
            INSERT INTO patients ({cols})
            VALUES ({vals})
            RETURNING *
        """)
        result = await self.session.execute(stmt, data)
        row = result.mappings().first()
        await self.session.commit()
        return dict(row) if row else {}

    async def update_patient(self, tenant_id: str, patient_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        sets = ", ".join([f"{k} = :{k}" for k in data.keys()])
        stmt = text(f"""
            UPDATE patients SET {sets}, updated_at = NOW()
            WHERE id = :id AND tenant_id = :tenant_id
            RETURNING *
        """)
        params = data.copy()
        params["id"] = patient_id
        params["tenant_id"] = tenant_id
        result = await self.session.execute(stmt, params)
        row = result.mappings().first()
        await self.session.commit()
        return dict(row) if row else None

    async def list_patients(self, tenant_id: str, offset: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        stmt = text("""
            SELECT * FROM patients 
            WHERE tenant_id = :tenant_id
            ORDER BY created_at DESC 
            OFFSET :offset LIMIT :limit
        """)
        result = await self.session.execute(stmt, {"tenant_id": tenant_id, "offset": offset, "limit": limit})
        return [dict(row) for row in result.mappings().all()]
