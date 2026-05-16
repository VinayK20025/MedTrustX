"""
MedTrustX Orders Service — Order Events Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.orders import OrderEventCreate, OrderEventResponse
from src.services import orders_service

router = APIRouter(prefix="/orders", tags=["Order Events"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/{order_id}/events",
    response_model=OrderEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add an event to an order",
)
async def add_order_event(
    order_id: uuid.UUID,
    data: OrderEventCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        event = await orders_service.add_order_event(session, tenant_id, order_id, data)
        await session.commit()
        return event
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
