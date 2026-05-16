"""
Role Repository.
"""
from typing import Optional, Dict, Any, List
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

class RoleRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_role_by_name(self, role_name: str) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM roles WHERE name = :name")
        result = await self.session.execute(stmt, {"name": role_name})
        row = result.mappings().first()
        return dict(row) if row else None
        
    async def get_role_by_id(self, role_id: UUID) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM roles WHERE id = :id")
        result = await self.session.execute(stmt, {"id": str(role_id)})
        row = result.mappings().first()
        return dict(row) if row else None

    async def assign_role(self, user_id: UUID, role_id: UUID, tenant_id: UUID, assigned_by: UUID) -> None:
        stmt = text("""
            INSERT INTO user_roles (id, user_id, role_id, tenant_id, assigned_by, assigned_at)
            VALUES (gen_random_uuid(), :uid, :rid, :tenant, :assigner, NOW())
            ON CONFLICT DO NOTHING
        """)
        await self.session.execute(stmt, {
            "uid": str(user_id),
            "rid": str(role_id),
            "tenant": str(tenant_id),
            "assigner": str(assigned_by)
        })
        await self.session.commit()

    async def revoke_role(self, user_id: UUID, role_id: UUID, tenant_id: UUID) -> None:
        stmt = text("""
            UPDATE user_roles SET deleted_at = NOW() 
            WHERE user_id = :uid AND role_id = :rid AND tenant_id = :tenant AND deleted_at IS NULL
        """)
        await self.session.execute(stmt, {
            "uid": str(user_id),
            "rid": str(role_id),
            "tenant": str(tenant_id)
        })
        await self.session.commit()

    async def get_user_roles(self, user_id: UUID) -> List[Dict[str, Any]]:
        stmt = text("""
            SELECT r.*, ur.tenant_id as scope_tenant_id 
            FROM roles r 
            JOIN user_roles ur ON r.id = ur.role_id 
            WHERE ur.user_id = :uid AND ur.deleted_at IS NULL
        """)
        result = await self.session.execute(stmt, {"uid": str(user_id)})
        return [dict(row) for row in result.mappings().all()]
