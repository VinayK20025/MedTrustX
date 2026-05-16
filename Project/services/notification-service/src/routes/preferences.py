"""
MedTrustX Notification Service — Preferences Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.notifications import PreferenceResponse, PreferenceUpdate
from src.services import notification_service

router = APIRouter(prefix="/users", tags=["Preferences"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get(
    "/{user_id}/preferences",
    response_model=List[PreferenceResponse],
    summary="Get user notification preferences",
)
async def get_preferences(
    user_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await notification_service.get_preferences(session, tenant_id, user_id)

@router.put(
    "/{user_id}/preferences",
    response_model=PreferenceResponse,
    summary="Update user notification preference for a channel",
)
async def update_preference(
    user_id: uuid.UUID,
    data: PreferenceUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    preference = await notification_service.update_preference(session, tenant_id, user_id, data)
    await session.commit()
    return preference
