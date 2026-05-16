"""
Control Repository.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class ControlRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_evidence(self, control_id: str, tenant_id: str) -> List[Dict[str, Any]]:
        stmt = text("""
            SELECT * FROM audit_log
            WHERE tenant_id = :tenant_id
            ORDER BY created_at DESC
            LIMIT 10
        """)
        result = await self.session.execute(stmt, {"tenant_id": tenant_id})
        return [dict(row) for row in result.mappings().all()]
