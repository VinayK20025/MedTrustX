"""
OAuth2 Introspection caching.
"""
import httpx
import redis.asyncio as redis_async
import json
from typing import Dict, Any
from app.config import settings

class OAuth2Introspector:
    def __init__(self):
        self.redis = redis_async.from_url(settings.redis_url)
        self.url = f"{settings.keycloak_url}/realms/{settings.keycloak_realm}/protocol/openid-connect/token/introspect"
        
    async def introspect(self, token: str) -> Dict[str, Any]:
        import hashlib
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        cache_key = f"medtrust:gateway:introspect:{token_hash}"
        
        cached = await self.redis.get(cache_key)
        if cached:
            return json.loads(cached)
            
        async with httpx.AsyncClient() as client:
            res = await client.post(
                self.url,
                data={"token": token, "client_id": settings.keycloak_client_id, "client_secret": settings.keycloak_client_secret},
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            res.raise_for_status()
            data = res.json()
            
            if data.get("active"):
                await self.redis.setex(cache_key, 60, json.dumps(data))
                
            return data
