"""
JIT Request Repository.
"""
from typing import Optional, Dict, Any, List
from uuid import UUID
import json

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

class JITRequestRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_request(self, request_id: UUID, user_id: UUID, tenant_id: UUID, 
                             resource_type: str, resource_id: str, reason: str, 
                             duration_minutes: int) -> None:
        stmt = text("""
            INSERT INTO pam_jit_requests (
                id, user_id, tenant_id, resource_type, resource_id, 
                reason, duration_minutes, status, created_at, updated_at
            ) VALUES (
                :id, :uid, :tenant, :rt, :rid, :reason, :dur, 'pending', NOW(), NOW()
            )
        """)
        await self.session.execute(stmt, {
            "id": str(request_id),
            "uid": str(user_id),
            "tenant": str(tenant_id),
            "rt": resource_type,
            "rid": resource_id,
            "reason": reason,
            "dur": duration_minutes
        })
        await self.session.commit()

    async def get_request(self, request_id: UUID) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM pam_jit_requests WHERE id = :id")
        result = await self.session.execute(stmt, {"id": str(request_id)})
        row = result.mappings().first()
        return dict(row) if row else None

    async def update_status(self, request_id: UUID, status: str, approved_by: Optional[UUID] = None) -> None:
        if approved_by:
            stmt = text("""
                UPDATE pam_jit_requests 
                SET status = :status, approved_by = :approver, approved_at = NOW(), updated_at = NOW() 
                WHERE id = :id
            """)
            await self.session.execute(stmt, {"id": str(request_id), "status": status, "approver": str(approved_by)})
        else:
            stmt = text("UPDATE pam_jit_requests SET status = :status, updated_at = NOW() WHERE id = :id")
            await self.session.execute(stmt, {"id": str(request_id), "status": status})
        await self.session.commit()

    async def list_pending_requests(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        stmt = text("SELECT * FROM pam_jit_requests WHERE tenant_id = :tenant AND status = 'pending' ORDER BY created_at ASC")
        result = await self.session.execute(stmt, {"tenant": str(tenant_id)})
        return [dict(row) for row in result.mappings().all()]
