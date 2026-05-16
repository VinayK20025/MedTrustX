"""
MedTrustX Inventory Service — Batches Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.inventory import StockBatchCreate, StockBatchResponse
from src.services import inventory_service

router = APIRouter(prefix="/batches", tags=["Batches"])

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
    response_model=StockBatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new physical batch of stock (triggers inbound movement)",
)
async def create_batch(
    data: StockBatchCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        batch = await inventory_service.create_batch(session, tenant_id, data)
        await session.commit()
        return batch
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/{batch_id}",
    response_model=StockBatchResponse,
    summary="Get specific batch details (e.g. expiry checking)",
)
async def get_batch(
    batch_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    batch = await inventory_service.get_batch(session, tenant_id, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch
