"""
MedTrustX Facilities Service — Maintenance Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.facilities import (
    MaintenanceRequestCreate,
    MaintenanceRequestResponse,
    MaintenanceRequestUpdate,
    MaintenanceScheduleCreate,
    MaintenanceScheduleResponse,
)
from src.services import facilities_service

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/requests",
    response_model=MaintenanceRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a reactive break-fix maintenance request",
)
async def create_maintenance_request(
    data: MaintenanceRequestCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        req = await facilities_service.create_maintenance_request(session, tenant_id, data)
        await session.commit()
        return req
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/requests/{request_id}",
    response_model=MaintenanceRequestResponse,
    summary="Get maintenance ticket details",
)
async def get_maintenance_request(
    request_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    req = await facilities_service.get_maintenance_request(session, tenant_id, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    return req

@router.put(
    "/requests/{request_id}",
    response_model=MaintenanceRequestResponse,
    summary="Update maintenance ticket status (e.g. resolve)",
)
async def update_maintenance_request(
    request_id: uuid.UUID,
    data: MaintenanceRequestUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    req = await facilities_service.update_maintenance_request(session, tenant_id, request_id, data)
    if not req:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    await session.commit()
    return req

@router.post(
    "/schedules",
    response_model=MaintenanceScheduleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a proactive maintenance schedule for an asset",
)
async def create_maintenance_schedule(
    data: MaintenanceScheduleCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        sched = await facilities_service.create_maintenance_schedule(session, tenant_id, data)
        await session.commit()
        return sched
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/schedules/{schedule_id}",
    response_model=MaintenanceScheduleResponse,
    summary="Get maintenance schedule details",
)
async def get_maintenance_schedule(
    schedule_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    sched = await facilities_service.get_maintenance_schedule(session, tenant_id, schedule_id)
    if not sched:
        raise HTTPException(status_code=404, detail="Maintenance schedule not found")
    return sched

