"""
MedTrustX Mortuary Management Service — Business Logic Layer

Records, storage, allocations, custody, and releases.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.mortuary import (
    BodyAllocation,
    CustodyLog,
    MortuaryRecord,
    Release,
    StorageUnit,
)
from src.schemas.mortuary import (
    BodyAllocationCreate,
    CustodyLogCreate,
    MortuaryRecordCreate,
    ReleaseCreate,
    StorageUnitCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Records ──

async def create_record(
    session: AsyncSession, tenant_id: uuid.UUID, data: MortuaryRecordCreate
) -> MortuaryRecord:
    record = MortuaryRecord(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        date_of_death=data.date_of_death,
        cause=data.cause,
        status="received",
    )
    session.add(record)
    await session.flush()
    await publish_event("BODY_RECEIVED", tenant_id, record.id, {"patient_id": str(data.patient_id)})
    return record


async def get_record(
    session: AsyncSession, tenant_id: uuid.UUID, record_id: uuid.UUID
) -> Optional[MortuaryRecord]:
    result = await session.execute(
        select(MortuaryRecord).where(and_(MortuaryRecord.id == record_id, MortuaryRecord.tenant_id == tenant_id, MortuaryRecord.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Storage Units ──

async def create_storage_unit(
    session: AsyncSession, tenant_id: uuid.UUID, data: StorageUnitCreate
) -> StorageUnit:
    unit = StorageUnit(
        tenant_id=tenant_id,
        unit_number=data.unit_number,
        capacity=data.capacity,
    )
    session.add(unit)
    await session.flush()
    return unit


async def get_storage_unit(
    session: AsyncSession, tenant_id: uuid.UUID, unit_id: uuid.UUID
) -> Optional[StorageUnit]:
    result = await session.execute(
        select(StorageUnit).where(and_(StorageUnit.id == unit_id, StorageUnit.tenant_id == tenant_id, StorageUnit.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Allocations ──

async def allocate_body(
    session: AsyncSession, tenant_id: uuid.UUID, data: BodyAllocationCreate
) -> BodyAllocation:
    allocation = BodyAllocation(
        tenant_id=tenant_id,
        mortuary_record_id=data.mortuary_record_id,
        storage_unit_id=data.storage_unit_id,
    )
    session.add(allocation)
    
    unit = await get_storage_unit(session, tenant_id, data.storage_unit_id)
    if unit:
        unit.status = "occupied"
        
    record = await get_record(session, tenant_id, data.mortuary_record_id)
    if record:
        record.status = "stored"
        
    await session.flush()
    await publish_event("STORAGE_ALLOCATED", tenant_id, allocation.id, {"storage_unit_id": str(data.storage_unit_id)})
    return allocation


async def get_allocation(
    session: AsyncSession, tenant_id: uuid.UUID, allocation_id: uuid.UUID
) -> Optional[BodyAllocation]:
    result = await session.execute(
        select(BodyAllocation).where(and_(BodyAllocation.id == allocation_id, BodyAllocation.tenant_id == tenant_id, BodyAllocation.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Custody Logs ──

async def log_custody(
    session: AsyncSession, tenant_id: uuid.UUID, data: CustodyLogCreate
) -> CustodyLog:
    log = CustodyLog(
        tenant_id=tenant_id,
        mortuary_record_id=data.mortuary_record_id,
        action=data.action,
        performed_by=data.performed_by,
    )
    session.add(log)
    await session.flush()
    return log


async def get_custody_logs(
    session: AsyncSession, tenant_id: uuid.UUID, record_id: uuid.UUID
) -> List[CustodyLog]:
    result = await session.execute(
        select(CustodyLog).where(and_(CustodyLog.mortuary_record_id == record_id, CustodyLog.tenant_id == tenant_id, CustodyLog.deleted_at.is_(None)))
        .order_by(CustodyLog.performed_at.asc())
    )
    return list(result.scalars().all())


# ── Releases ──

async def release_body(
    session: AsyncSession, tenant_id: uuid.UUID, data: ReleaseCreate
) -> Release:
    release = Release(
        tenant_id=tenant_id,
        mortuary_record_id=data.mortuary_record_id,
        released_to=data.released_to,
    )
    session.add(release)
    
    record = await get_record(session, tenant_id, data.mortuary_record_id)
    if record:
        record.status = "released"
        
        # Free up storage unit
        alloc_result = await session.execute(
            select(BodyAllocation).where(and_(BodyAllocation.mortuary_record_id == record.id, BodyAllocation.tenant_id == tenant_id))
        )
        allocation = alloc_result.scalar_one_or_none()
        if allocation:
            unit = await get_storage_unit(session, tenant_id, allocation.storage_unit_id)
            if unit:
                unit.status = "available"
        
    await session.flush()
    await publish_event("BODY_RELEASED", tenant_id, release.id, {"record_id": str(data.mortuary_record_id)})
    return release


async def get_release(
    session: AsyncSession, tenant_id: uuid.UUID, release_id: uuid.UUID
) -> Optional[Release]:
    result = await session.execute(
        select(Release).where(and_(Release.id == release_id, Release.tenant_id == tenant_id, Release.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()
