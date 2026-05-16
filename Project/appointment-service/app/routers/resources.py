"""
Resources Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from app.dependencies import get_redis
from app.services.resource_allocator import ResourceAllocator
from app.models.resource import ResourceRequest

router = APIRouter(prefix="/api/resources", tags=["resources"])

@router.post("/allocate")
async def allocate_resource(
    request: Request,
    payload: ResourceRequest,
    redis = Depends(get_redis)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    allocator = ResourceAllocator(redis)
    
    success = await allocator.allocate(tenant_id, payload.resource_type, payload.time_slot)
    if not success:
        raise HTTPException(status_code=409, detail="Resource unavailable at this time")
        
    return {"status": "allocated", "resource": payload.resource_type}
