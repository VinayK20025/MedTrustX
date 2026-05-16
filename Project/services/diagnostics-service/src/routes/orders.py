"""
MedTrustX Diagnostics Service — Diagnostic Order Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.diagnostics import (
    DiagnosticOrderCreate,
    DiagnosticOrderDetailResponse,
    DiagnosticOrderResponse,
    DiagnosticOrderUpdate,
)
from src.services import diagnostics_service

router = APIRouter(prefix="/orders", tags=["Orders"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id(request: Request) -> uuid.UUID:
    user_id_str = getattr(request.state, "user_id", None) or request.headers.get("X-User-ID")
    if not user_id_str:
        return uuid.uuid4()
    return uuid.UUID(str(user_id_str))

@router.post(
    "/",
    response_model=DiagnosticOrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create diagnostic order",
)
async def create_order(
    data: DiagnosticOrderCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    try:
        order = await diagnostics_service.create_order(session, tenant_id, user_id, data)
        await session.commit()
        return order
    except Exception as exc:
        await session.rollback()
        raise HTTPException(status_code=422, detail=str(exc))

@router.get(
    "/{order_id}",
    response_model=DiagnosticOrderDetailResponse,
    summary="Get full order details",
)
async def get_order(
    order_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    order = await diagnostics_service.get_order(session, tenant_id, order_id, load_relations=True)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put(
    "/{order_id}",
    response_model=DiagnosticOrderResponse,
    summary="Update order status",
)
async def update_order(
    order_id: uuid.UUID,
    data: DiagnosticOrderUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    order = await diagnostics_service.update_order(session, tenant_id, order_id, data)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    await session.commit()
    return order
