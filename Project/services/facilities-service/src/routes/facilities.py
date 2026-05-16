"""
MedTrustX Facilities Service — Facilities Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.facilities import FacilityCreate, FacilityResponse, FacilityUpdate
from src.services import facilities_service

router = APIRouter(prefix="/facilities", tags=["Facilities"])

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
    response_model=FacilityResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new building or facility",
)
async def create_facility(
    data: FacilityCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    facility = await facilities_service.create_facility(session, tenant_id, data)
    await session.commit()
    return await facilities_service.get_facility(session, tenant_id, facility.id)

@router.get(
    "/{facility_id}",
    response_model=FacilityResponse,
    summary="Get facility details including rooms",
)
async def get_facility(
    facility_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    facility = await facilities_service.get_facility(session, tenant_id, facility_id)
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    return facility

@router.put(
    "/{facility_id}",
    response_model=FacilityResponse,
    summary="Update facility status",
)
async def update_facility(
    facility_id: uuid.UUID,
    data: FacilityUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    facility = await facilities_service.update_facility(session, tenant_id, facility_id, data)
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    await session.commit()
    return await facilities_service.get_facility(session, tenant_id, facility_id)
