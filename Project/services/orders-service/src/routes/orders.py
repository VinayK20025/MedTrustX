"""
MedTrustX Orders Service — Orders Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.orders import OrderCreate, OrderDetail, OrderList, OrderResponse, OrderUpdate
from src.services import orders_service

router = APIRouter(prefix="/orders", tags=["Orders"])

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
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new order",
)
async def create_order(
    data: OrderCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    order = await orders_service.create_order(session, tenant_id, data)
    await session.commit()
    return order

@router.get(
    "/",
    response_model=OrderList,
    summary="List all orders",
)
async def list_orders(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    orders, total = await orders_service.list_orders(session, tenant_id, page=page, page_size=page_size)
    return OrderList(items=orders, total=total, page=page, page_size=page_size)

@router.get(
    "/{order_id}",
    response_model=OrderDetail,
    summary="Get order details",
)
async def get_order(
    order_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    order = await orders_service.get_order(session, tenant_id, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Update an order",
)
async def update_order(
    order_id: uuid.UUID,
    data: OrderUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    order = await orders_service.update_order(session, tenant_id, order_id, data)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    await session.commit()
    return order
