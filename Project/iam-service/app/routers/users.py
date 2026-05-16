"""
Users Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from uuid import UUID
from typing import List, Optional

from app.models.user import UserCreateRequest, UserResponse, UserDetailResponse, UserUpdateRequest
from app.db.session import get_session
from app.db.repositories.user_repo import UserRepository
from app.services.user_provisioner import UserProvisioner

router = APIRouter(prefix="/api/iam/users", tags=["users"])

def _check_admin(request: Request):
    roles = getattr(request.state, "roles", [])
    if "IT_Admin" not in roles and "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Role required: IT_Admin or superadmin")

@router.post("", response_model=UserResponse)
async def create_user(request_body: UserCreateRequest, request: Request, session=Depends(get_session)):
    _check_admin(request)
    provisioner = UserProvisioner(session)
    result = await provisioner.provision_user(
        request_body.username, request_body.email, request_body.first_name, 
        request_body.last_name, request_body.role, request_body.department, 
        request_body.tenant_id
    )
    return UserResponse(**result)

@router.get("", response_model=List[UserResponse])
async def list_users(
    tenant_id: Optional[UUID] = Query(None), 
    page: int = Query(1, ge=1), 
    page_size: int = Query(50, ge=1, le=100),
    session=Depends(get_session)
):
    repo = UserRepository(session)
    users = await repo.list_users(tenant_id, page, page_size)
    return [
        UserResponse(
            id=u["id"], username=u["username"], email=u["email"],
            first_name=u["metadata"].get("first_name", ""),
            last_name=u["metadata"].get("last_name", ""),
            status=u["status"], tenant_id=u["tenant_id"]
        ) for u in users
    ]

@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(user_id: UUID, session=Depends(get_session)):
    repo = UserRepository(session)
    user = await repo.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return UserDetailResponse(
        id=user["id"], username=user["username"], email=user["email"],
        first_name=user["metadata"].get("first_name", ""),
        last_name=user["metadata"].get("last_name", ""),
        status=user["status"], tenant_id=user["tenant_id"],
        role_assignments=[],
        mfa_methods_enrolled=user["metadata"].get("mfa_enrolled", []),
        active_sessions=0,
        registered_devices=0,
        last_login=None
    )

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(user_id: UUID, request_body: UserUpdateRequest, request: Request, session=Depends(get_session)):
    _check_admin(request)
    repo = UserRepository(session)
    user = await repo.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    status = request_body.status or user["status"]
    metadata = user["metadata"]
    if request_body.department:
        metadata["department"] = request_body.department
    if request_body.metadata:
        metadata.update(request_body.metadata)
        
    await repo.update_user(user_id, status, metadata)
    
    return UserResponse(
        id=user["id"], username=user["username"], email=user["email"],
        first_name=metadata.get("first_name", ""),
        last_name=metadata.get("last_name", ""),
        status=status, tenant_id=user["tenant_id"]
    )

@router.delete("/{user_id}")
async def delete_user(user_id: UUID, request: Request, session=Depends(get_session)):
    roles = getattr(request.state, "roles", [])
    if "superadmin" not in roles:
        raise HTTPException(status_code=403, detail="Role required: superadmin")
        
    repo = UserRepository(session)
    await repo.soft_delete(user_id)
    return {"status": "deleted"}
