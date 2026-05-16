"""
Parallel Request Aggregation.
"""
import asyncio
import httpx
from typing import List, Dict, Any, Callable
from app.services.service_registry import ServiceRegistry
from app.services.circuit_breaker import CircuitBreaker
from app.observability.logging import get_logger

logger = get_logger(__name__)

class RequestComposer:
    def __init__(self, headers: dict = None):
        self.registry = ServiceRegistry()
        self.circuit = CircuitBreaker()
        self.headers = headers or {}
        
    async def _call_service(self, service_name: str, path: str, method: str = "GET", **kwargs) -> Any:
        url = await self.registry.resolve(service_name)
        if not url:
            return {"error": f"Service {service_name} not found"}
            
        full_url = f"{url}{path}"
        
        async def make_request():
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.request(method, full_url, headers=self.headers, **kwargs)
                if res.status_code >= 500:
                    res.raise_for_status()
                if res.status_code >= 400:
                    return {"error": f"HTTP {res.status_code}"}
                return res.json()
                
        try:
            return await self.circuit.call(service_name, make_request)
        except Exception as e:
            logger.error(f"Failed to call {service_name}{path}: {e}")
            return {"error": "Service unavailable"}

    async def compose(self, spec: List[Dict[str, Any]]) -> List[Any]:
        tasks = []
        for req in spec:
            tasks.append(self._call_service(
                service_name=req["service"],
                path=req["path"],
                method=req.get("method", "GET"),
                params=req.get("params")
            ))
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results
