"""
Roles Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from uuid import UUID

from app.models.role import RoleAssignmentRequest, RoleRevokeRequest
from app.db.session import get_session
from app.db.repositories.role_repo import RoleRepository
from app.services.role_enforcer import RoleEnforcer

router = APIRouter(prefix="/api/iam/roles", tags=["roles"])

@router.post("/assign")
async def assign_role(request_body: RoleAssignmentRequest, request: Request, session=Depends(get_session)):
    repo = RoleRepository(session)
    await repo.assign_role(
        request_body.user_id, request_body.role_id, 
        request_body.tenant_id, request_body.assigned_by
    )
    return {"status": "role_assigned"}

@router.delete("/revoke")
async def revoke_role(request_body: RoleRevokeRequest, session=Depends(get_session)):
    repo = RoleRepository(session)
    await repo.revoke_role(request_body.user_id, request_body.role_id, request_body.tenant_id)
    return {"status": "role_revoked"}

@router.get("/permissions/{role_name}")
async def get_permissions(role_name: str):
    enforcer = RoleEnforcer()
    perms = enforcer.get_permissions(role_name)
    if not perms:
        raise HTTPException(status_code=404, detail="Role not found")
    return {"role": role_name, "permissions": perms}
