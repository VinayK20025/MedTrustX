"""
MedTrustX Management Service — Flags Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.management import FeatureFlagCreate, FeatureFlagResponse, FeatureFlagUpdate
from src.services import management_service

router = APIRouter(prefix="/feature-flags", tags=["Feature Flags"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id() -> uuid.UUID:
    return uuid.uuid4()

@router.post(
    "/",
    response_model=FeatureFlagResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_feature_flag(
    data: FeatureFlagCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id()
    flag = await management_service.create_feature_flag(session, tenant_id, data, user_id)
    await session.commit()
    return flag

@router.get(
    "/{flag_id}",
    response_model=FeatureFlagResponse,
)
async def get_feature_flag(
    flag_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    flag = await management_service.get_feature_flag(session, tenant_id, flag_id)
    if not flag:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    return flag

@router.put(
    "/{flag_id}",
    response_model=FeatureFlagResponse,
)
async def update_feature_flag(
    flag_id: uuid.UUID,
    data: FeatureFlagUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id()
    flag = await management_service.update_feature_flag(session, tenant_id, flag_id, data, user_id)
    if not flag:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    await session.commit()
    return flag
