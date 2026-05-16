"""
MedTrustX Bed Management Service — Reservation Routes

API: POST /bed-reservations | GET /bed-reservations/{id} | PUT /bed-reservations/{id}
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.beds import BedReservationCreate, BedReservationResponse, BedReservationUpdate
from src.services import bed_service

router = APIRouter(prefix="/bed-reservations", tags=["Bed Reservations"])


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
    response_model=BedReservationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Reserve a bed for incoming patient",
    description="Pre-book a bed for scheduled admissions, ER transfers, or surgical holds.",
)
async def create_reservation(
    data: BedReservationCreate, request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        resv = await bed_service.create_reservation(session, tenant_id, data)
        await session.commit()
        return resv
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/{reservation_id}",
    response_model=BedReservationResponse,
    summary="Get reservation details",
)
async def get_reservation(
    reservation_id: uuid.UUID, request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    resv = await bed_service.get_reservation(session, tenant_id, reservation_id)
    if not resv:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return resv


@router.put(
    "/{reservation_id}",
    response_model=BedReservationResponse,
    summary="Update reservation status",
    description="Confirm, fulfil, cancel, or expire a reservation.",
)
async def update_reservation(
    reservation_id: uuid.UUID, data: BedReservationUpdate, request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    resv = await bed_service.update_reservation(session, tenant_id, reservation_id, data)
    if not resv:
        raise HTTPException(status_code=404, detail="Reservation not found")
    await session.commit()
    return resv
