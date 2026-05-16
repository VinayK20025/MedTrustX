"""
MedTrustX Inventory Service — Movements Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.inventory import StockMovementCreate, StockMovementResponse
from src.services import inventory_service

router = APIRouter(prefix="/movements", tags=["Movements"])

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
    response_model=StockMovementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record an inventory transaction (inbound, outbound, write-off)",
)
async def create_movement(
    data: StockMovementCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        movement = await inventory_service.create_movement(session, tenant_id, data)
        await session.commit()
        return movement
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
