"""
MedTrustX Management Service — Settings Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.management import TenantSettingCreate, TenantSettingResponse, TenantSettingUpdate
from src.services import management_service

router = APIRouter(prefix="/tenant-settings", tags=["Tenant Settings"])

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
    response_model=TenantSettingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_tenant_setting(
    data: TenantSettingCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id()
    setting = await management_service.upsert_tenant_setting(session, tenant_id, data, user_id)
    await session.commit()
    return setting

@router.get(
    "/{setting_id}",
    response_model=TenantSettingResponse,
)
async def get_tenant_setting(
    setting_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    setting = await management_service.get_tenant_setting(session, tenant_id, setting_id)
    if not setting:
        raise HTTPException(status_code=404, detail="Tenant setting not found")
    return setting

@router.put(
    "/{setting_id}",
    response_model=TenantSettingResponse,
)
async def update_tenant_setting(
    setting_id: uuid.UUID,
    data: TenantSettingUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id()
    
    # Needs the key, retrieve it first
    existing = await management_service.get_tenant_setting(session, tenant_id, setting_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Tenant setting not found")
        
    create_data = TenantSettingCreate(setting_key=existing.setting_key, setting_value=data.setting_value)
    setting = await management_service.upsert_tenant_setting(session, tenant_id, create_data, user_id)
    await session.commit()
    return setting
