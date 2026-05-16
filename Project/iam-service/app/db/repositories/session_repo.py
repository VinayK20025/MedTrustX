"""
Session Repository.
"""
from typing import Optional, Dict, Any, List
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

class SessionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_session(self, session_id: UUID, user_id: UUID, device_id: UUID, 
                             tenant_id: UUID, mfa_method: str, ip_address: str, 
                             expires_at: str) -> None:
        stmt = text("""
            INSERT INTO sessions (
                id, user_id, device_id, tenant_id, mfa_method_used, 
                last_known_ip, created_at, updated_at, expires_at
            ) VALUES (
                :id, :uid, :did, :tenant, :mfa, :ip, NOW(), NOW(), :exp
            )
        """)
        await self.session.execute(stmt, {
            "id": str(session_id),
            "uid": str(user_id),
            "did": str(device_id),
            "tenant": str(tenant_id),
            "mfa": mfa_method,
            "ip": ip_address,
            "exp": expires_at
        })
        await self.session.commit()

    async def get_session(self, session_id: UUID) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM sessions WHERE id = :id AND deleted_at IS NULL AND expires_at > NOW()")
        result = await self.session.execute(stmt, {"id": str(session_id)})
        row = result.mappings().first()
        return dict(row) if row else None

    async def update_session_activity(self, session_id: UUID, ip_address: str) -> None:
        stmt = text("UPDATE sessions SET updated_at = NOW(), last_known_ip = :ip WHERE id = :id AND deleted_at IS NULL")
        await self.session.execute(stmt, {"id": str(session_id), "ip": ip_address})
        await self.session.commit()

    async def revoke_session(self, session_id: UUID) -> None:
        stmt = text("UPDATE sessions SET deleted_at = NOW() WHERE id = :id")
        await self.session.execute(stmt, {"id": str(session_id)})
        await self.session.commit()

    async def revoke_user_sessions(self, user_id: UUID) -> None:
        stmt = text("UPDATE sessions SET deleted_at = NOW() WHERE user_id = :uid AND deleted_at IS NULL")
        await self.session.execute(stmt, {"uid": str(user_id)})
        await self.session.commit()

    async def get_active_sessions(self, tenant_id: UUID) -> int:
        stmt = text("SELECT COUNT(*) FROM sessions WHERE tenant_id = :tenant AND deleted_at IS NULL AND expires_at > NOW()")
        result = await self.session.execute(stmt, {"tenant": str(tenant_id)})
        return result.scalar() or 0
