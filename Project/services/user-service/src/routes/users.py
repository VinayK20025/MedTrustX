"""
MedTrustX User Management Service — Users Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.user import UserProfileCreate, UserProfileUpdate, UserProfileResponse
from src.services import user_service

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
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user profile",
)
async def create_user(
    data: UserProfileCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    profile = await user_service.create_user_profile(session, tenant_id, data)
    await session.commit()
    return profile

@router.get(
    "/{user_id}",
    response_model=UserProfileResponse,
    summary="Get a user profile",
)
async def get_user(
    user_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    profile = await user_service.get_user_profile(session, tenant_id, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

@router.put(
    "/{user_id}",
    response_model=UserProfileResponse,
    summary="Update a user profile",
)
async def update_user(
    user_id: uuid.UUID,
    data: UserProfileUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    profile = await user_service.update_user_profile(session, tenant_id, user_id, data)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    await session.commit()
    return profile
