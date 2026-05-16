"""
Dynamic Route CRUD.
"""
from app.services.kong_admin import KongAdminClient
from app.models.route import RouteCreateRequest
from typing import Dict, Any, List

class RouteManager:
    def __init__(self):
        self.kong = KongAdminClient()

    async def list_routes(self) -> List[Dict[str, Any]]:
        return await self.kong.get_routes()

    async def create_route(self, request: RouteCreateRequest) -> Dict[str, Any]:
        config = {
            "name": request.name,
            "paths": request.paths,
            "strip_path": request.strip_path
        }
        return await self.kong.create_route(request.service_id, config)

    async def delete_route(self, route_id: str) -> None:
        await self.kong.delete_route(route_id)
