"""
Plugins Management Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List, Dict, Any
from app.services.plugin_manager import PluginManager
from app.models.plugin import PluginEnableRequest

router = APIRouter(prefix="/api/gateway/plugins", tags=["plugins"])

@router.get("/")
async def list_plugins() -> List[Dict[str, Any]]:
    manager = PluginManager()
    return await manager.list_plugins()

@router.post("/")
async def enable_plugin(request: Request, payload: PluginEnableRequest) -> Dict[str, Any]:
    roles = getattr(request.state, "roles", [])
    if "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="superadmin role required")
        
    manager = PluginManager()
    return await manager.enable_plugin(payload)
