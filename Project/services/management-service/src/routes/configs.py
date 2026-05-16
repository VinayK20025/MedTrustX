"""
MedTrustX Management Service — Configs Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.management import SystemConfigCreate, SystemConfigResponse, SystemConfigUpdate
from src.services import management_service

router = APIRouter(prefix="/configs", tags=["Configs"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id() -> uuid.UUID:
    # Simulated user extraction
    return uuid.uuid4()

@router.post(
    "/",
    response_model=SystemConfigResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_config(
    data: SystemConfigCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id()
    config = await management_service.upsert_system_config(session, tenant_id, data, user_id)
    await session.commit()
    return config

@router.get(
    "/{key}",
    response_model=SystemConfigResponse,
)
async def get_config(
    key: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    config = await management_service.get_system_config(session, tenant_id, key)
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    return config

@router.put(
    "/{key}",
    response_model=SystemConfigResponse,
)
async def update_config(
    key: str,
    data: SystemConfigUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id()
    create_data = SystemConfigCreate(config_key=key, config_value=data.config_value)
    config = await management_service.upsert_system_config(session, tenant_id, create_data, user_id)
    await session.commit()
    return config
