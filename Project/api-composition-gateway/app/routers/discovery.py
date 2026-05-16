"""
Service Discovery Router.
"""
from fastapi import APIRouter, Request, HTTPException
from typing import List, Dict, Any
from app.services.service_registry import ServiceRegistry
from app.models.service_registry import ServiceRegistration

router = APIRouter(prefix="/api/discovery", tags=["discovery"])

@router.get("/services")
async def list_services() -> List[Dict[str, Any]]:
    registry = ServiceRegistry()
    return await registry.list_services()

@router.post("/register")
async def register_service(request: Request, payload: ServiceRegistration):
    roles = getattr(request.state, "roles", [])
    if "internal_service" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="internal_service role required")
        
    registry = ServiceRegistry()
    await registry.register(payload.service_name, payload.url, payload.health_endpoint)
    return {"status": "registered"}
