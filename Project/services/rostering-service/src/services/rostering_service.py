"""
MedTrustX Rostering Service — Business Logic Layer

Schedules, shifts, assignments, availability, and leaves.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.rostering import (
    Assignment,
    Availability,
    Leave,
    Schedule,
    Shift,
)
from src.schemas.rostering import (
    AssignmentCreate,
    AvailabilityCreate,
    LeaveCreate,
    ScheduleCreate,
    ShiftCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Schedules ──

async def create_schedule(
    session: AsyncSession, tenant_id: uuid.UUID, data: ScheduleCreate
) -> Schedule:
    schedule = Schedule(
        tenant_id=tenant_id,
        department=data.department,
        start_date=data.start_date,
        end_date=data.end_date,
    )
    session.add(schedule)
    await session.flush()
    return schedule


async def get_schedule(
    session: AsyncSession, tenant_id: uuid.UUID, schedule_id: uuid.UUID
) -> Optional[Schedule]:
    result = await session.execute(
        select(Schedule).where(and_(Schedule.id == schedule_id, Schedule.tenant_id == tenant_id, Schedule.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Shifts ──

async def create_shift(
    session: AsyncSession, tenant_id: uuid.UUID, data: ShiftCreate
) -> Shift:
    shift = Shift(
        tenant_id=tenant_id,
        schedule_id=data.schedule_id,
        shift_type=data.shift_type,
        start_time=data.start_time,
        end_time=data.end_time,
    )
    session.add(shift)
    await session.flush()
    return shift


async def get_shift(
    session: AsyncSession, tenant_id: uuid.UUID, shift_id: uuid.UUID
) -> Optional[Shift]:
    result = await session.execute(
        select(Shift).where(and_(Shift.id == shift_id, Shift.tenant_id == tenant_id, Shift.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Assignments ──

async def create_assignment(
    session: AsyncSession, tenant_id: uuid.UUID, data: AssignmentCreate
) -> Assignment:
    assignment = Assignment(
        tenant_id=tenant_id,
        shift_id=data.shift_id,
        user_id=data.user_id,
    )
    session.add(assignment)
    await session.flush()
    await publish_event("SHIFT_ASSIGNED", tenant_id, assignment.id, {"user_id": str(data.user_id), "shift_id": str(data.shift_id)})
    return assignment


async def get_assignment(
    session: AsyncSession, tenant_id: uuid.UUID, assignment_id: uuid.UUID
) -> Optional[Assignment]:
    result = await session.execute(
        select(Assignment).where(and_(Assignment.id == assignment_id, Assignment.tenant_id == tenant_id, Assignment.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Availability ──

async def log_availability(
    session: AsyncSession, tenant_id: uuid.UUID, data: AvailabilityCreate
) -> Availability:
    availability = Availability(
        tenant_id=tenant_id,
        user_id=data.user_id,
        available=data.available,
        from_time=data.from_time,
        to_time=data.to_time,
    )
    session.add(availability)
    await session.flush()
    if not data.available:
        await publish_event("STAFF_UNAVAILABLE", tenant_id, availability.id, {"user_id": str(data.user_id)})
    return availability


async def get_availability(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID
) -> List[Availability]:
    result = await session.execute(
        select(Availability).where(and_(Availability.user_id == user_id, Availability.tenant_id == tenant_id, Availability.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Leaves ──

async def request_leave(
    session: AsyncSession, tenant_id: uuid.UUID, data: LeaveCreate
) -> Leave:
    leave = Leave(
        tenant_id=tenant_id,
        user_id=data.user_id,
        leave_type=data.leave_type,
        start_date=data.start_date,
        end_date=data.end_date,
    )
    session.add(leave)
    await session.flush()
    await publish_event("LEAVE_REQUESTED", tenant_id, leave.id, {"user_id": str(data.user_id)})
    return leave


async def get_leaves(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID
) -> List[Leave]:
    result = await session.execute(
        select(Leave).where(and_(Leave.user_id == user_id, Leave.tenant_id == tenant_id, Leave.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
