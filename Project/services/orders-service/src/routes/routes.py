"""
MedTrustX Orders Service — Order Routing Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.orders import OrderRouteCreate, OrderRouteResponse
from src.services import orders_service

router = APIRouter(prefix="/orders", tags=["Order Routing"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/{order_id}/route",
    response_model=OrderRouteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Route an order to a downstream service",
)
async def route_order(
    order_id: uuid.UUID,
    data: OrderRouteCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        route = await orders_service.route_order(session, tenant_id, order_id, data)
        await session.commit()
        return route
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
