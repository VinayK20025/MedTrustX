"""
Plugin Lifecycle Manager.
"""
from app.services.kong_admin import KongAdminClient
from app.models.plugin import PluginEnableRequest
from typing import Dict, Any, List

class PluginManager:
    def __init__(self):
        self.kong = KongAdminClient()

    async def list_plugins(self) -> List[Dict[str, Any]]:
        return await self.kong.get_plugins()

    async def enable_plugin(self, request: PluginEnableRequest) -> Dict[str, Any]:
        return await self.kong.enable_plugin(
            name=request.name,
            config=request.config,
            route_id=request.route_id,
            service_id=request.service_id
        )

    async def disable_plugin(self, plugin_id: str) -> None:
        await self.kong.disable_plugin(plugin_id)
