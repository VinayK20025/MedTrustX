"""
MedTrustX Inventory Service — Items Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemResponse,
    StockLevelResponse,
)
from src.services import inventory_service

router = APIRouter(prefix="/items", tags=["Items"])

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
    response_model=InventoryItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new item to the master catalog",
)
async def create_item(
    data: InventoryItemCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    item = await inventory_service.create_item(session, tenant_id, data)
    await session.commit()
    return item

@router.get(
    "/{item_id}",
    response_model=InventoryItemResponse,
    summary="Get item catalog details",
)
async def get_item(
    item_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    item = await inventory_service.get_item(session, tenant_id, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.get(
    "/{item_id}/stock",
    response_model=StockLevelResponse,
    summary="Get real-time available stock quantity for an item",
)
async def get_stock_level(
    item_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    level = await inventory_service.get_stock_level(session, tenant_id, item_id)
    if not level:
        raise HTTPException(status_code=404, detail="Stock level not found")
    return level
