"""
MedTrustX Orders Service — Patient Orders Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.orders import OrderResponse
from src.services import orders_service

router = APIRouter(prefix="/patients", tags=["Patient Orders"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get(
    "/{patient_id}/orders",
    response_model=List[OrderResponse],
    summary="Get all orders for a patient",
)
async def get_patient_orders(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await orders_service.list_orders_by_patient(session, tenant_id, patient_id)
