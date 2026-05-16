"""
MedTrustX Marketing Service — Funnels Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.marketing import FunnelCreate, FunnelResponse
from src.services import marketing_service

router = APIRouter(prefix="/funnels", tags=["Funnels"])

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
    response_model=FunnelResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new funnel",
)
async def create_funnel(
    data: FunnelCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    funnel = await marketing_service.create_funnel(session, tenant_id, data)
    await session.commit()
    return funnel

@router.get(
    "/{funnel_id}",
    response_model=FunnelResponse,
    summary="Get funnel details",
)
async def get_funnel(
    funnel_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    funnel = await marketing_service.get_funnel(session, tenant_id, funnel_id)
    if not funnel:
        raise HTTPException(status_code=404, detail="Funnel not found")
    return funnel
