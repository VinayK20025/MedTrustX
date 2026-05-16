"""
MedTrustX User Management Service — Preferences Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.user import UserPreferenceCreate, UserPreferenceResponse
from src.services import user_service

router = APIRouter(prefix="/users/{user_id}/preferences", tags=["Preferences"])

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
    response_model=UserPreferenceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Set a user preference",
)
async def set_preference(
    user_id: uuid.UUID,
    data: UserPreferenceCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    pref = await user_service.set_user_preference(session, tenant_id, user_id, data)
    await session.commit()
    return pref

@router.get(
    "/",
    response_model=List[UserPreferenceResponse],
    summary="Get all user preferences",
)
async def get_preferences(
    user_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await user_service.get_user_preferences(session, tenant_id, user_id)
