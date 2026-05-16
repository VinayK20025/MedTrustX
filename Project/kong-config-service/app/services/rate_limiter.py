"""
Adaptive Rate Limiting.
"""
import redis.asyncio as redis_async
from app.config import settings

class AdaptiveRateLimiter:
    def __init__(self):
        self.redis = redis_async.from_url(settings.redis_url)

    async def compute_limit(self, tenant_id: str, endpoint: str, current_load: float) -> int:
        base_limits = {
            "/api/ai/": 60,
            "/api/iam/auth/": 20,
            "/api/clinical/": 300,
            "/api/patients/": 200,
            "/fhir/r4/": 150
        }
        
        base_limit = 1000
        for prefix, limit in base_limits.items():
            if endpoint.startswith(prefix):
                base_limit = limit
                break
                
        adjusted_limit = base_limit
        if current_load > 80.0:
            adjusted_limit = int(adjusted_limit * 0.7)
            
        is_ddos = await self.redis.get(f"medtrust:gateway:ddos:{tenant_id}")
        if is_ddos:
            adjusted_limit = int(adjusted_limit * 0.3)
            
        if tenant_id == "tenant_apollo":
            adjusted_limit = int(adjusted_limit * 1.2)
            
        key = f"medtrust:gateway:ratelimit:{tenant_id}:{endpoint}"
        await self.redis.setex(key, 60, adjusted_limit)
        
        return adjusted_limit
