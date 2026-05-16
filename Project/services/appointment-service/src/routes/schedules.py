"""
MedTrustX Appointments Service — Schedules Routes
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.appointments import ScheduleCreate, ScheduleResponse, ScheduleUpdate
from src.services import appointment_service

router = APIRouter(prefix="/schedules", tags=["Schedules"])

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
    response_model=ScheduleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Define a recurring schedule for a clinician",
)
async def create_schedule(
    data: ScheduleCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    schedule = await appointment_service.create_schedule(session, tenant_id, data)
    await session.commit()
    return schedule

@router.get(
    "/{schedule_id}",
    response_model=ScheduleResponse,
    summary="Get a specific schedule definition",
)
async def get_schedule(
    schedule_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    schedule = await appointment_service.get_schedule(session, tenant_id, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.put(
    "/{schedule_id}",
    response_model=ScheduleResponse,
    summary="Update a schedule definition",
)
async def update_schedule(
    schedule_id: uuid.UUID,
    data: ScheduleUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    schedule = await appointment_service.update_schedule(session, tenant_id, schedule_id, data)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    await session.commit()
    return schedule
