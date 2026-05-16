"""
MedTrustX Orders Service — Items Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.orders import OrderItemCreate, OrderItemResponse
from src.services import orders_service

router = APIRouter(prefix="/orders", tags=["Order Items"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/{order_id}/items",
    response_model=List[OrderItemResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Add items to an order",
)
async def add_order_items(
    order_id: uuid.UUID,
    items: List[OrderItemCreate],
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        new_items = await orders_service.add_order_items(session, tenant_id, order_id, items)
        await session.commit()
        return new_items
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/{order_id}/items",
    response_model=List[OrderItemResponse],
    summary="Get items for an order",
)
async def get_order_items(
    order_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await orders_service.get_order_items(session, tenant_id, order_id)
