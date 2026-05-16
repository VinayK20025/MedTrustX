"""
MedTrustX Management Service — Service Configs Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.management import ServiceConfigCreate, ServiceConfigResponse
from src.services import management_service

router = APIRouter(prefix="/service-configs", tags=["Service Configs"])

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
    response_model=ServiceConfigResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_service_config(
    data: ServiceConfigCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id()
    config = await management_service.create_service_config(session, tenant_id, data, user_id)
    await session.commit()
    return config

@router.get(
    "/{config_id}",
    response_model=ServiceConfigResponse,
)
async def get_service_config(
    config_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    config = await management_service.get_service_config(session, tenant_id, config_id)
    if not config:
        raise HTTPException(status_code=404, detail="Service config not found")
    return config
