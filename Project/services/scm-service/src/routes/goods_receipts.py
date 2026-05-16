"""
MedTrustX SCM Service — Goods Receipts Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.scm import (
    GoodsReceiptCreate,
    GoodsReceiptResponse,
    GoodsReceiptUpdate,
)
from src.services import scm_service

router = APIRouter(prefix="/goods-receipts", tags=["Goods Receipts"])

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
    response_model=GoodsReceiptResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log physical arrival of stock at the hospital",
)
async def create_goods_receipt(
    data: GoodsReceiptCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        receipt = await scm_service.create_goods_receipt(session, tenant_id, data)
        await session.commit()
        return receipt
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/{receipt_id}",
    response_model=GoodsReceiptResponse,
    summary="Get details of a specific goods receipt",
)
async def get_goods_receipt(
    receipt_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    receipt = await scm_service.get_goods_receipt(session, tenant_id, receipt_id)
    if not receipt:
        raise HTTPException(status_code=404, detail="Goods receipt not found")
    return receipt

@router.put(
    "/{receipt_id}",
    response_model=GoodsReceiptResponse,
    summary="Update QA status of a goods receipt (accept/reject)",
)
async def update_goods_receipt(
    receipt_id: uuid.UUID,
    data: GoodsReceiptUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    receipt = await scm_service.update_goods_receipt_status(session, tenant_id, receipt_id, data)
    if not receipt:
        raise HTTPException(status_code=404, detail="Goods receipt not found")
    await session.commit()
    return receipt
