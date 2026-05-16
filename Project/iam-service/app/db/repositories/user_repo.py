"""
User Repository.
"""
from typing import Optional, Dict, Any, List
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_user(self, user_id: UUID, username: str, email: str, password_hash: str,
                          tenant_id: UUID, metadata: Dict[str, Any]) -> None:
        import json
        stmt = text("""
            INSERT INTO users (id, username, email, password_hash, tenant_id, status, metadata, created_at, updated_at)
            VALUES (:id, :username, :email, :pw, :tenant, 'active', :metadata::jsonb, NOW(), NOW())
        """)
        await self.session.execute(stmt, {
            "id": str(user_id),
            "username": username,
            "email": email,
            "pw": password_hash,
            "tenant": str(tenant_id),
            "metadata": json.dumps(metadata)
        })
        await self.session.commit()

    async def get_user_by_id(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM users WHERE id = :id AND deleted_at IS NULL")
        result = await self.session.execute(stmt, {"id": str(user_id)})
        row = result.mappings().first()
        return dict(row) if row else None

    async def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        stmt = text("SELECT * FROM users WHERE username = :username AND deleted_at IS NULL")
        result = await self.session.execute(stmt, {"username": username})
        row = result.mappings().first()
        return dict(row) if row else None

    async def update_user(self, user_id: UUID, status: str, metadata: Dict[str, Any]) -> None:
        import json
        stmt = text("""
            UPDATE users SET status = :status, metadata = :metadata::jsonb, updated_at = NOW()
            WHERE id = :id
        """)
        await self.session.execute(stmt, {
            "id": str(user_id),
            "status": status,
            "metadata": json.dumps(metadata)
        })
        await self.session.commit()

    async def soft_delete(self, user_id: UUID) -> None:
        stmt = text("UPDATE users SET deleted_at = NOW() WHERE id = :id")
        await self.session.execute(stmt, {"id": str(user_id)})
        await self.session.commit()

    async def list_users(self, tenant_id: Optional[UUID], page: int, page_size: int) -> List[Dict[str, Any]]:
        query = "SELECT * FROM users WHERE deleted_at IS NULL"
        params = {"limit": page_size, "offset": (page - 1) * page_size}
        if tenant_id:
            query += " AND tenant_id = :tenant"
            params["tenant"] = str(tenant_id)
        
        query += " ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
        stmt = text(query)
        result = await self.session.execute(stmt, params)
        return [dict(row) for row in result.mappings().all()]
