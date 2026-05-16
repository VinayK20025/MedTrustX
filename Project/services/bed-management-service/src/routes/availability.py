"""
MedTrustX Bed Management Service — Availability Dashboard Route

API: GET /beds/availability
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.beds import BedAvailabilityResponse
from src.services import bed_service

router = APIRouter(prefix="/beds", tags=["Bed Availability"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


@router.get(
    "/availability",
    response_model=BedAvailabilityResponse,
    summary="Get real-time bed availability",
    description=(
        "Returns hospital-wide bed capacity dashboard with breakdown "
        "by ward and bed type. Shows total, available, occupied, reserved, "
        "cleaning, maintenance, and blocked counts with occupancy rates."
    ),
)
async def get_availability(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    data = await bed_service.get_availability(session, tenant_id)
    return data
