"""
Tenant Repository.
Handles tenant_registry operations across databases.
"""
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.tenant_registry import TenantRegistryRecord

class TenantRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, tenant_id: UUID) -> Optional[TenantRegistryRecord]:
        result = await self.session.execute(
            select(TenantRegistryRecord).where(TenantRegistryRecord.tenant_id == tenant_id)
        )
        return result.scalars().first()

    async def get_by_slug(self, tenant_slug: str) -> Optional[TenantRegistryRecord]:
        result = await self.session.execute(
            select(TenantRegistryRecord).where(TenantRegistryRecord.tenant_slug == tenant_slug)
        )
        return result.scalars().first()

    async def list_all(self) -> List[TenantRegistryRecord]:
        result = await self.session.execute(select(TenantRegistryRecord))
        return list(result.scalars().all())

    async def create(self, record: TenantRegistryRecord) -> TenantRegistryRecord:
        self.session.add(record)
        await self.session.flush()
        return record

    async def update_status(self, tenant_id: UUID, status: str) -> None:
        await self.session.execute(
            update(TenantRegistryRecord)
            .where(TenantRegistryRecord.tenant_id == tenant_id)
            .values(status=status)
        )
        await self.session.flush()
