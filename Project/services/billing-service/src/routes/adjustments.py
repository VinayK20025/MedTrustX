"""
MedTrustX Billing Service — Adjustments Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.billing import AdjustmentCreate, AdjustmentResponse
from src.services import billing_service

router = APIRouter(prefix="/adjustments", tags=["Adjustments"])

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
    response_model=AdjustmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Apply a discount, tax, or correction to an invoice",
)
async def create_adjustment(
    data: AdjustmentCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        adjustment = await billing_service.create_adjustment(session, tenant_id, data)
        await session.commit()
        return adjustment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/{adjustment_id}",
    response_model=AdjustmentResponse,
    summary="Get details of a specific adjustment",
)
async def get_adjustment(
    adjustment_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    adjustment = await billing_service.get_adjustment(session, tenant_id, adjustment_id)
    if not adjustment:
        raise HTTPException(status_code=404, detail="Adjustment not found")
    return adjustment
