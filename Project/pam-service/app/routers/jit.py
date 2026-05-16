"""
JIT Routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from typing import List
from uuid import UUID

from app.models.jit import JITCreateRequest, JITResponse, JITApprovalRequest
from app.db.session import get_session
from app.dependencies import get_redis
from app.services.jit_manager import JITManager

router = APIRouter(prefix="/api/pam/jit", tags=["jit"])

@router.post("/requests", response_model=JITResponse)
async def request_jit(request_body: JITCreateRequest, request: Request, session=Depends(get_session), redis=Depends(get_redis)):
    manager = JITManager(session, redis)
    user_id = UUID(request.state.user_id)
    tenant_id = UUID(request.state.tenant_id)
    
    res = await manager.request_access(
        user_id, tenant_id, request_body.resource_type, 
        request_body.resource_id, request_body.reason, request_body.duration_minutes
    )
    return JITResponse(
        id=res["id"],
        user_id=res["user_id"],
        tenant_id=res["tenant_id"],
        resource_type=res["resource_type"],
        resource_id=res["resource_id"],
        status=res["status"],
        created_at=res.get("created_at") or "2026-01-01T00:00:00Z"
    )

@router.get("/requests/pending", response_model=List[JITResponse])
async def list_pending(request: Request, session=Depends(get_session), redis=Depends(get_redis)):
    roles = getattr(request.state, "roles", [])
    if "IT_Admin" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Approver role required")
        
    manager = JITManager(session, redis)
    tenant_id = UUID(request.state.tenant_id)
    
    reqs = await manager.repo.list_pending_requests(tenant_id)
    return [
        JITResponse(
            id=r["id"], user_id=r["user_id"], tenant_id=r["tenant_id"],
            resource_type=r["resource_type"], resource_id=r["resource_id"],
            status=r["status"], created_at=r["created_at"],
            approved_at=r.get("approved_at"), approved_by=r.get("approved_by")
        ) for r in reqs
    ]

@router.post("/requests/{request_id}/approve")
async def approve_jit(request_id: UUID, request_body: JITApprovalRequest, request: Request, session=Depends(get_session), redis=Depends(get_redis)):
    roles = getattr(request.state, "roles", [])
    if "IT_Admin" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Approver role required")
        
    manager = JITManager(session, redis)
    approver_id = UUID(request.state.user_id)
    
    try:
        await manager.approve_request(request_id, approver_id, request_body.status)
        return {"status": "success", "action": request_body.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/check")
async def check_access(resource_type: str, resource_id: str, request: Request, session=Depends(get_session), redis=Depends(get_redis)):
    manager = JITManager(session, redis)
    user_id = str(request.state.user_id)
    
    has_access = await manager.check_access(user_id, resource_type, resource_id)
    return {"has_access": has_access}
