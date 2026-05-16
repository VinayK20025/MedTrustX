"""
MedTrustX Inventory Service — Reservations Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.inventory import StockReservationCreate, StockReservationResponse
from src.services import inventory_service

router = APIRouter(prefix="/reservations", tags=["Reservations"])

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
    response_model=StockReservationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Hard-allocate stock for an upcoming procedure",
)
async def create_reservation(
    data: StockReservationCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        reservation = await inventory_service.create_reservation(session, tenant_id, data)
        await session.commit()
        return reservation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/{reservation_id}",
    response_model=StockReservationResponse,
    summary="Get details of a stock reservation",
)
async def get_reservation(
    reservation_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    reservation = await inventory_service.get_reservation(session, tenant_id, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation
