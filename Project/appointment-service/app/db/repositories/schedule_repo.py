"""
Provider Schedule Repository.
"""
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime

class ScheduleRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_provider_availability(self, tenant_id: str, provider_id: str, date_start: datetime, date_end: datetime) -> List[Dict[str, Any]]:
        await self.session.execute(text("SET LOCAL app.tenant_id = :tenant_id"), {"tenant_id": tenant_id})
        
        stmt = text("""
            SELECT * FROM provider_schedules
            WHERE provider_id = :provider_id
              AND tenant_id = :tenant_id
              AND start_time >= :date_start
              AND end_time <= :date_end
              AND is_available = TRUE
            ORDER BY start_time ASC
        """)
        
        result = await self.session.execute(stmt, {
            "provider_id": provider_id, 
            "tenant_id": tenant_id,
            "date_start": date_start,
            "date_end": date_end
        })
        return [dict(row) for row in result.mappings().all()]
