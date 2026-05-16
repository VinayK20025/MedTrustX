from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Any, Dict, List
from uuid import UUID

from app.models.bypass import BypassRequest, BypassResponse
from app.db.repositories.bypass_repo import BypassRepository
from app.dependencies import get_redis

router = APIRouter(prefix="/api/rls/bypass", tags=["bypass"])

def _check_superadmin(request: Request):
    roles = getattr(request.state, "roles", [])
    if "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Superadmin role required")

@router.post("/request", response_model=BypassResponse)
async def request_bypass(request_body: BypassRequest, request: Request, redis=Depends(get_redis)):
    _check_superadmin(request)
    repo = BypassRepository(redis)
    # Using the user_id from the request state who is making the request
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID missing from request state")
        
    token = await repo.request_bypass(
        user_id=UUID(user_id),
        target_tenant_id=request_body.target_tenant_id,
        reason=request_body.reason,
        duration_minutes=request_body.duration_minutes,
        approver_id=request_body.approver_id
    )
    
    from datetime import datetime, timedelta, timezone
    return BypassResponse(
        bypass_token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=request_body.duration_minutes)
    )

@router.delete("/{user_id}/{tenant_id}")
async def revoke_bypass(user_id: UUID, tenant_id: UUID, request: Request, redis=Depends(get_redis)):
    _check_superadmin(request)
    repo = BypassRepository(redis)
    await repo.revoke_bypass(user_id, tenant_id)
    return {"status": "revoked"}

@router.get("/active")
async def get_active_bypasses(request: Request, redis=Depends(get_redis)):
    _check_superadmin(request)
    repo = BypassRepository(redis)
    bypasses = await repo.list_active_bypasses()
    return bypasses
