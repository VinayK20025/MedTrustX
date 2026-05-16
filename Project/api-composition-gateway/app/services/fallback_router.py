"""
Static Fallback Routing.
"""
import httpx
from fastapi import Request, Response
from app.services.service_registry import ServiceRegistry
from app.observability.logging import get_logger

logger = get_logger(__name__)

class FallbackRouter:
    def __init__(self):
        self.registry = ServiceRegistry()

    async def route(self, service_name: str, path: str, request: Request) -> Response:
        url = await self.registry.resolve(service_name)
        if not url:
            return Response("Service not found", status_code=404)
            
        full_url = f"{url}{path}"
        headers = dict(request.headers)
        headers.pop("host", None)
        
        async with httpx.AsyncClient() as client:
            try:
                if request.method in ["POST", "PUT", "PATCH"]:
                    body = await request.body()
                    res = await client.request(request.method, full_url, content=body, headers=headers)
                else:
                    res = await client.request(request.method, full_url, headers=headers)
                
                return Response(
                    content=res.content, 
                    status_code=res.status_code, 
                    headers=dict(res.headers)
                )
            except Exception as e:
                logger.error(f"Fallback route failed: {e}")
                return Response("Bad Gateway", status_code=502)
