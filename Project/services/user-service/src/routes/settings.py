"""
MedTrustX User Management Service — Settings Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.user import UserSettingCreate, UserSettingResponse
from src.services import user_service

router = APIRouter(prefix="/users/{user_id}/settings", tags=["Settings"])

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
    response_model=UserSettingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Set a user setting",
)
async def set_setting(
    user_id: uuid.UUID,
    data: UserSettingCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    setting = await user_service.set_user_setting(session, tenant_id, user_id, data)
    await session.commit()
    return setting

@router.get(
    "/",
    response_model=List[UserSettingResponse],
    summary="Get all user settings",
)
async def get_settings(
    user_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await user_service.get_user_settings(session, tenant_id, user_id)
