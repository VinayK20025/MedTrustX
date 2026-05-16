"""
MedTrustX Housekeeping Service — Business Logic Layer

Tasks, room status, sanitation logs, and waste management.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.housekeeping import (
    HousekeepingTask,
    RoomStatus,
    SanitationLog,
    WasteManagement,
    HousekeepingEvent,
)
from src.schemas.housekeeping import (
    HousekeepingTaskCreate,
    RoomStatusUpdate,
    SanitationLogCreate,
    WasteManagementCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Housekeeping Tasks ──

async def create_task(
    session: AsyncSession, tenant_id: uuid.UUID, data: HousekeepingTaskCreate
) -> HousekeepingTask:
    task = HousekeepingTask(
        tenant_id=tenant_id,
        room_id=data.room_id,
        task_type=data.task_type,
        assigned_to=data.assigned_to,
        scheduled_at=data.scheduled_at,
    )
    session.add(task)
    await session.flush()
    await publish_event("CLEANING_TASK_CREATED", tenant_id, task.id, {"room_id": str(data.room_id), "task_type": data.task_type})
    return task


async def get_task(
    session: AsyncSession, tenant_id: uuid.UUID, task_id: uuid.UUID
) -> Optional[HousekeepingTask]:
    result = await session.execute(
        select(HousekeepingTask).where(and_(HousekeepingTask.id == task_id, HousekeepingTask.tenant_id == tenant_id, HousekeepingTask.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Room Status ──

async def update_room_status(
    session: AsyncSession, tenant_id: uuid.UUID, data: RoomStatusUpdate
) -> RoomStatus:
    result = await session.execute(
        select(RoomStatus).where(and_(RoomStatus.room_id == data.room_id, RoomStatus.tenant_id == tenant_id, RoomStatus.deleted_at.is_(None)))
    )
    status_record = result.scalar_one_or_none()

    if status_record:
        status_record.status = data.status
    else:
        status_record = RoomStatus(
            tenant_id=tenant_id,
            room_id=data.room_id,
            status=data.status,
        )
        session.add(status_record)

    await session.flush()

    if data.status == "ready":
        await publish_event("ROOM_READY", tenant_id, status_record.id, {"room_id": str(data.room_id)})

    return status_record


async def get_room_status(
    session: AsyncSession, tenant_id: uuid.UUID, room_id: uuid.UUID
) -> Optional[RoomStatus]:
    result = await session.execute(
        select(RoomStatus).where(and_(RoomStatus.room_id == room_id, RoomStatus.tenant_id == tenant_id, RoomStatus.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Sanitation Logs ──

async def log_sanitation(
    session: AsyncSession, tenant_id: uuid.UUID, data: SanitationLogCreate
) -> SanitationLog:
    log_entry = SanitationLog(
        tenant_id=tenant_id,
        area=data.area,
        cleaning_type=data.cleaning_type,
    )
    session.add(log_entry)
    await session.flush()
    await publish_event("SANITATION_COMPLETED", tenant_id, log_entry.id, {"area": data.area})
    return log_entry


async def get_sanitation_logs(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[SanitationLog]:
    result = await session.execute(
        select(SanitationLog).where(and_(SanitationLog.tenant_id == tenant_id, SanitationLog.deleted_at.is_(None)))
        .order_by(SanitationLog.performed_at.desc()).limit(limit)
    )
    return list(result.scalars().all())


# ── Waste Management ──

async def record_waste(
    session: AsyncSession, tenant_id: uuid.UUID, data: WasteManagementCreate
) -> WasteManagement:
    waste = WasteManagement(
        tenant_id=tenant_id,
        waste_type=data.waste_type,
        quantity=data.quantity,
    )
    session.add(waste)
    await session.flush()
    return waste


# ── Events ──

async def get_events(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[HousekeepingEvent]:
    result = await session.execute(
        select(HousekeepingEvent).where(and_(HousekeepingEvent.tenant_id == tenant_id, HousekeepingEvent.deleted_at.is_(None)))
        .order_by(HousekeepingEvent.created_at.desc()).limit(limit)
    )
    return list(result.scalars().all())
