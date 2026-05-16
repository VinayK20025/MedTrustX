"""
Bypass Repository.
Wrapper around PAMBypassManager to abstract Redis client.
"""
from uuid import UUID
from typing import List

from redis.asyncio import Redis
from medtrust_rls.bypass import PAMBypassManager, BypassSession

class BypassRepository:
    def __init__(self, redis_client: Redis):
        self.manager = PAMBypassManager(redis_client)

    async def request_bypass(
        self, 
        user_id: UUID, 
        target_tenant_id: UUID, 
        reason: str,
        duration_minutes: int, 
        approver_id: UUID
    ) -> str:
        return await self.manager.request_bypass(
            user_id, target_tenant_id, reason, duration_minutes, approver_id
        )

    async def revoke_bypass(self, user_id: UUID, tenant_id: UUID) -> None:
        await self.manager.revoke_bypass(user_id, tenant_id)

    async def is_bypass_active(self, user_id: UUID, tenant_id: UUID) -> bool:
        return await self.manager.is_bypass_active(user_id, tenant_id)

    async def list_active_bypasses(self) -> List[BypassSession]:
        return await self.manager.list_active_bypasses()
