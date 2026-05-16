"""
Routes Management Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List, Dict, Any
from app.services.route_manager import RouteManager
from app.models.route import RouteCreateRequest

router = APIRouter(prefix="/api/gateway/routes", tags=["routes"])

@router.get("/")
async def list_routes() -> List[Dict[str, Any]]:
    manager = RouteManager()
    return await manager.list_routes()

@router.post("/")
async def create_route(request: Request, payload: RouteCreateRequest) -> Dict[str, Any]:
    roles = getattr(request.state, "roles", [])
    if "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="superadmin role required")
        
    manager = RouteManager()
    return await manager.create_route(payload)

@router.delete("/{route_id}")
async def delete_route(request: Request, route_id: str) -> Dict[str, str]:
    roles = getattr(request.state, "roles", [])
    if "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="superadmin role required")
        
    manager = RouteManager()
    await manager.delete_route(route_id)
    return {"status": "success"}
