"""
Hybrid Service Discovery.
"""
import asyncio
import json
import redis.asyncio as redis_async
import httpx
from typing import Dict, Any, List

from app.config import settings
from app.observability.logging import get_logger

logger = get_logger(__name__)

class ServiceRegistry:
    def __init__(self):
        self.redis = redis_async.from_url(settings.redis_url)
        self.static_registry = {
            "patient-service": "http://patient-service:8018",
            "clinical-service": "http://clinical-service:8019",
            "appointment-service": "http://appointment-service:8020",
            "ai-platform-service": "http://ai-platform-service:8010",
            "audit-service": "http://audit-service:8015",
            "compliance-service": "http://compliance-service:8016",
            "consent-service": "http://consent-service:8017",
            "zta-service": "http://zta-service:8012",
            "iam-service": "http://iam-service:8013",
            "pam-service": "http://pam-service:8014",
            "rls-manager-service": "http://rls-manager-service:8011",
        }

    async def initialize(self):
        for name, url in self.static_registry.items():
            data = {"url": url, "health": "healthy", "weight": 1.0}
            await self.redis.set(f"medtrust:registry:{name}", json.dumps(data))

    async def resolve(self, service_name: str) -> str:
        try:
            cached = await self.redis.get(f"medtrust:registry:{service_name}")
            if cached:
                data = json.loads(cached)
                return data["url"]
        except Exception:
            pass
            
        return self.static_registry.get(service_name)

    async def list_services(self) -> List[Dict[str, Any]]:
        services = []
        for name in self.static_registry.keys():
            url = await self.resolve(name)
            try:
                state_b = await self.redis.get(f"medtrust:circuit:{name}:state")
                state = state_b.decode() if state_b else "CLOSED"
            except:
                state = "CLOSED"
                
            services.append({
                "service_name": name,
                "url": url,
                "health": "healthy",
                "circuit_state": state,
                "avg_response_ms": 0.0
            })
        return services

    async def register(self, name: str, url: str, health_endpoint: str):
        data = {"url": url, "health": "healthy", "weight": 1.0, "health_endpoint": health_endpoint}
        await self.redis.set(f"medtrust:registry:{name}", json.dumps(data))
        
        msg = {"service_name": name, "url": url, "event": "service_registered"}
        await self.redis.publish("medtrust:gateway:discovery", json.dumps(msg))

async def health_check_task():
    registry = ServiceRegistry()
    await registry.initialize()
    while True:
        await asyncio.sleep(15)
        for name in registry.static_registry.keys():
            url = await registry.resolve(name)
            try:
                async with httpx.AsyncClient(timeout=2.0) as client:
                    res = await client.get(f"{url}/health")
                    health = "healthy" if res.status_code == 200 else "degraded"
            except:
                health = "down"
            
            cached = await registry.redis.get(f"medtrust:registry:{name}")
            if cached:
                data = json.loads(cached)
                data["health"] = health
                data["weight"] = 1.0 if health == "healthy" else (0.5 if health == "degraded" else 0.0)
                await registry.redis.set(f"medtrust:registry:{name}", json.dumps(data))
