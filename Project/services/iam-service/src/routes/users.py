"""
MedTrustX IAM Service — Users Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.iam import UserCreate, UserResponse, UserUpdate, UserRoleAssign
from src.services import iam_service

router = APIRouter(prefix="/users", tags=["Users"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
)
async def create_user(
    data: UserCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user = await iam_service.create_user(session, tenant_id, data)
    await session.commit()
    return user

@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get user details",
)
async def get_user(
    user_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user = await iam_service.get_user(session, tenant_id, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update a user",
)
async def update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user = await iam_service.update_user(session, tenant_id, user_id, data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await session.commit()
    return user

@router.post(
    "/{user_id}/roles",
    status_code=status.HTTP_201_CREATED,
    summary="Assign a role to a user",
)
async def assign_role(
    user_id: uuid.UUID,
    data: UserRoleAssign,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_role = await iam_service.assign_role_to_user(session, tenant_id, user_id, data)
    if not user_role:
        raise HTTPException(status_code=400, detail="User or Role not found")
    await session.commit()
    return {"status": "success", "message": "Role assigned successfully"}
