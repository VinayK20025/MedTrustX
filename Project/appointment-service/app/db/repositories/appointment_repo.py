"""
Appointment Repository.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime

class AppointmentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_appointment(self, tenant_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        
        cols = ", ".join(data.keys())
        vals = ", ".join([f":{k}" for k in data.keys()])
        
        stmt = text(f"""
            INSERT INTO appointments ({cols})
            VALUES ({vals})
            RETURNING *
        """)
        
        result = await self.session.execute(stmt, data)
        row = result.mappings().first()
        await self.session.commit()
        return dict(row) if row else {}

    async def update_appointment(self, tenant_id: str, appointment_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        
        updates["updated_at"] = datetime.utcnow()
        set_clause = ", ".join([f"{k} = :{k}" for k in updates.keys()])
        
        params = updates.copy()
        params["appointment_id"] = appointment_id
        params["tenant_id"] = tenant_id
        
        stmt = text(f"""
            UPDATE appointments 
            SET {set_clause}
            WHERE id = :appointment_id AND tenant_id = :tenant_id
            RETURNING *
        """)
        
        result = await self.session.execute(stmt, params)
        row = result.mappings().first()
        await self.session.commit()
        return dict(row) if row else None

    async def get_patient_appointments(self, tenant_id: str, patient_id: str) -> List[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        
        stmt = text("""
            SELECT * FROM appointments 
            WHERE patient_id = :patient_id AND tenant_id = :tenant_id
            ORDER BY start_time ASC
        """)
        
        result = await self.session.execute(stmt, {"patient_id": patient_id, "tenant_id": tenant_id})
        return [dict(row) for row in result.mappings().all()]

    async def check_conflicts(self, tenant_id: str, provider_id: str, start_time: datetime, end_time: datetime, exclude_id: str = None) -> bool:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        
        query = """
            SELECT 1 FROM appointments
            WHERE provider_id = :provider_id
              AND tenant_id = :tenant_id
              AND status NOT IN ('cancelled', 'noshow')
              AND start_time < :end_time
              AND end_time > :start_time
        """
        params = {"provider_id": provider_id, "tenant_id": tenant_id, "start_time": start_time, "end_time": end_time}
        
        if exclude_id:
            query += " AND id != :exclude_id"
            params["exclude_id"] = exclude_id
            
        stmt = text(query)
        result = await self.session.execute(stmt, params)
        return result.first() is not None
