"""
Resource Allocation logic.
"""
from typing import Dict, Any, List

class ResourceAllocator:
    def __init__(self, redis_client):
        self.redis = redis_client
        
    async def allocate(self, tenant_id: str, resource_type: str, time_slot: str) -> bool:
        key = f"medtrust:resources:{tenant_id}:{resource_type}:{time_slot}"
        success = await self.redis.setnx(key, "allocated")
        if success:
            await self.redis.expire(key, 3600)
        return success
