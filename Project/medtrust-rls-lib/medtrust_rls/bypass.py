"""
PAM Bypass Manager.

Manages Privileged Access Management bypass tokens via Redis.
"""

import json
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict
from redis.asyncio import Redis

class BypassSession(BaseModel):
    model_config = ConfigDict(strict=True)

    user_id: UUID
    tenant_id: UUID
    reason: str
    approver_id: UUID
    granted_at: datetime
    expires_at: datetime

class PAMBypassManager:
    """Manages privileged access bypass sessions in Redis."""
    
    def __init__(self, redis_client: Redis):
        self.redis = redis_client

    def _key(self, user_id: str | UUID, tenant_id: str | UUID) -> str:
        return f"medtrust:pam:approved:{str(user_id)}:{str(tenant_id)}"

    async def request_bypass(
        self, 
        user_id: UUID, 
        target_tenant_id: UUID, 
        reason: str,
        duration_minutes: int, 
        approver_id: UUID
    ) -> str:
        """
        Create a PAM bypass session in Redis.
        Returns a mock bypass_token for reference.
        """
        now = datetime.now(timezone.utc)
        expires = now + timedelta(minutes=duration_minutes)
        
        session = BypassSession(
            user_id=user_id,
            tenant_id=target_tenant_id,
            reason=reason,
            approver_id=approver_id,
            granted_at=now,
            expires_at=expires
        )
        
        key = self._key(user_id, target_tenant_id)
        value = json.dumps(session.model_dump(), default=str)
        
        await self.redis.set(key, value, ex=duration_minutes * 60)
        
        # Return a simple token string
        return f"pam_token_{user_id}_{target_tenant_id}"

    async def revoke_bypass(self, user_id: UUID, tenant_id: UUID) -> None:
        """Immediately delete the PAM bypass session from Redis."""
        await self.redis.delete(self._key(user_id, tenant_id))

    async def is_bypass_active(self, user_id: UUID, tenant_id: UUID) -> bool:
        """Check if a valid PAM bypass session exists."""
        return await self.redis.exists(self._key(user_id, tenant_id)) > 0

    async def list_active_bypasses(self) -> List[BypassSession]:
        """List all active PAM bypass sessions across all users and tenants."""
        sessions = []
        # Use SCAN for safe iteration over keys
        cursor = b"0"
        pattern = "medtrust:pam:approved:*:*"
        
        while cursor:
            cursor, keys = await self.redis.scan(cursor, match=pattern, count=100)
            for key in keys:
                data = await self.redis.get(key)
                if data:
                    try:
                        parsed = json.loads(data)
                        sessions.append(BypassSession(**parsed))
                    except (json.JSONDecodeError, ValueError):
                        pass
        return sessions
