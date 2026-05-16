"""
MedTrustX SCM Service — Purchase Orders Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.scm import (
    PurchaseOrderCreate,
    PurchaseOrderResponse,
    PurchaseOrderUpdate,
)
from src.services import scm_service

router = APIRouter(prefix="/purchase-orders", tags=["Purchase Orders"])

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
    response_model=PurchaseOrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new purchase order",
)
async def create_purchase_order(
    data: PurchaseOrderCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        po = await scm_service.create_purchase_order(session, tenant_id, data)
        await session.commit()
        return await scm_service.get_purchase_order(session, tenant_id, po.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/{po_id}",
    response_model=PurchaseOrderResponse,
    summary="Get purchase order details including line items",
)
async def get_purchase_order(
    po_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    po = await scm_service.get_purchase_order(session, tenant_id, po_id)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return po

@router.put(
    "/{po_id}",
    response_model=PurchaseOrderResponse,
    summary="Update purchase order status (e.g., approval workflow)",
)
async def update_purchase_order(
    po_id: uuid.UUID,
    data: PurchaseOrderUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    po = await scm_service.update_purchase_order_status(session, tenant_id, po_id, data)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    await session.commit()
    return await scm_service.get_purchase_order(session, tenant_id, po_id)
