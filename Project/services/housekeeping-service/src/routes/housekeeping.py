"""
MedTrustX Housekeeping Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.housekeeping import (
    HousekeepingEventResponse,
    HousekeepingTaskCreate, HousekeepingTaskResponse,
    RoomStatusUpdate, RoomStatusResponse,
    SanitationLogCreate, SanitationLogResponse,
    WasteManagementCreate, WasteManagementResponse
)
from src.services import housekeeping_service

router = APIRouter(tags=["Housekeeping Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Housekeeping Tasks ──

@router.post("/housekeeping/tasks", response_model=HousekeepingTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(data: HousekeepingTaskCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    task = await housekeeping_service.create_task(session, tid, data)
    await session.commit()
    return task

@router.get("/housekeeping/tasks/{task_id}", response_model=HousekeepingTaskResponse)
async def get_task(task_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    task = await housekeeping_service.get_task(session, tid, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


# ── Room Status ──

@router.post("/room-status", response_model=RoomStatusResponse)
async def update_room_status(data: RoomStatusUpdate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    rs = await housekeeping_service.update_room_status(session, tid, data)
    await session.commit()
    return rs

@router.get("/room-status/{room_id}", response_model=RoomStatusResponse)
async def get_room_status(room_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    rs = await housekeeping_service.get_room_status(session, tid, room_id)
    if not rs:
        raise HTTPException(status_code=404, detail="Room status not found")
    return rs


# ── Sanitation Logs ──

@router.post("/sanitation-logs", response_model=SanitationLogResponse, status_code=status.HTTP_201_CREATED)
async def log_sanitation(data: SanitationLogCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    sl = await housekeeping_service.log_sanitation(session, tid, data)
    await session.commit()
    return sl

@router.get("/sanitation-logs", response_model=List[SanitationLogResponse])
async def get_sanitation_logs(request: Request, limit: int = 50, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await housekeeping_service.get_sanitation_logs(session, tid, limit)


# ── Waste Management ──

@router.post("/waste-management", response_model=WasteManagementResponse, status_code=status.HTTP_201_CREATED)
async def record_waste(data: WasteManagementCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    wm = await housekeeping_service.record_waste(session, tid, data)
    await session.commit()
    return wm


# ── Housekeeping Events ──

@router.get("/housekeeping/events", response_model=List[HousekeepingEventResponse])
async def get_events(request: Request, limit: int = 50, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await housekeeping_service.get_events(session, tid, limit)
