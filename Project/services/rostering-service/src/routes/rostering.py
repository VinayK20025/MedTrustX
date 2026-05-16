"""
MedTrustX Rostering Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.rostering import (
    AssignmentCreate, AssignmentResponse,
    AvailabilityCreate, AvailabilityResponse,
    LeaveCreate, LeaveResponse,
    ScheduleCreate, ScheduleResponse,
    ShiftCreate, ShiftResponse
)
from src.services import rostering_service

router = APIRouter(tags=["Rostering Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Schedules ──

@router.post("/schedules", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(data: ScheduleCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    schedule = await rostering_service.create_schedule(session, tid, data)
    await session.commit()
    return schedule

@router.get("/schedules/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(schedule_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    schedule = await rostering_service.get_schedule(session, tid, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule


# ── Shifts ──

@router.post("/shifts", response_model=ShiftResponse, status_code=status.HTTP_201_CREATED)
async def create_shift(data: ShiftCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    shift = await rostering_service.create_shift(session, tid, data)
    await session.commit()
    return shift

@router.get("/shifts/{shift_id}", response_model=ShiftResponse)
async def get_shift(shift_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    shift = await rostering_service.get_shift(session, tid, shift_id)
    if not shift:
        raise HTTPException(status_code=404, detail="Shift not found")
    return shift


# ── Assignments ──

@router.post("/assignments", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assignment(data: AssignmentCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    assignment = await rostering_service.create_assignment(session, tid, data)
    await session.commit()
    return assignment

@router.get("/assignments/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment(assignment_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    assignment = await rostering_service.get_assignment(session, tid, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment


# ── Availability ──

@router.post("/availability", response_model=AvailabilityResponse, status_code=status.HTTP_201_CREATED)
async def log_availability(data: AvailabilityCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    availability = await rostering_service.log_availability(session, tid, data)
    await session.commit()
    return availability

@router.get("/availability/{user_id}", response_model=List[AvailabilityResponse])
async def get_availability(user_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await rostering_service.get_availability(session, tid, user_id)


# ── Leaves ──

@router.post("/leaves", response_model=LeaveResponse, status_code=status.HTTP_201_CREATED)
async def request_leave(data: LeaveCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    leave = await rostering_service.request_leave(session, tid, data)
    await session.commit()
    return leave

@router.get("/leaves/{user_id}", response_model=List[LeaveResponse])
async def get_leaves(user_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await rostering_service.get_leaves(session, tid, user_id)
