"""
MedTrustX OT Management Service — Bookings Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.ot import OTBookingCreate, OTBookingResponse
from src.services import ot_service

router = APIRouter(prefix="/ot-bookings", tags=["Bookings"])

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
    response_model=OTBookingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Book an OT Room for a Surgery (includes conflict checks)",
)
async def book_ot_room(
    data: OTBookingCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        booking = await ot_service.book_ot_room(session, tenant_id, data)
        await session.commit()
        return booking
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))
