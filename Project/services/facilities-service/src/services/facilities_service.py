"""
MedTrustX Facilities Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.facilities import (
    Asset,
    Facility,
    MaintenanceRequest,
    MaintenanceSchedule,
    Room,
)
from src.schemas.facilities import (
    AssetCreate,
    AssetUpdate,
    FacilityCreate,
    FacilityUpdate,
    MaintenanceRequestCreate,
    MaintenanceRequestUpdate,
    MaintenanceScheduleCreate,
    RoomCreate,
    RoomUpdate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Facilities ──────────────────────────────────────────────────
async def create_facility(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: FacilityCreate,
) -> Facility:
    facility = Facility(
        tenant_id=tenant_id,
        name=data.name,
        type=data.type,
        location=data.location,
    )
    session.add(facility)
    await session.flush()

    await publish_event(
        "FACILITY_CREATED",
        tenant_id=tenant_id,
        entity_id=facility.id,
        payload={"name": facility.name},
    )

    return facility


async def get_facility(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    facility_id: uuid.UUID,
) -> Optional[Facility]:
    result = await session.execute(
        select(Facility)
        .options(selectinload(Facility.rooms))
        .where(
            and_(
                Facility.id == facility_id,
                Facility.tenant_id == tenant_id,
                Facility.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_facility(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    facility_id: uuid.UUID,
    data: FacilityUpdate,
) -> Optional[Facility]:
    facility = await get_facility(session, tenant_id, facility_id)
    if not facility:
        return None

    if facility.status != data.status:
        facility.status = data.status
        facility.updated_at = datetime.now(timezone.utc)
        await session.flush()

    return facility


# ── Rooms ───────────────────────────────────────────────────────
async def create_room(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: RoomCreate,
) -> Room:
    facility = await get_facility(session, tenant_id, data.facility_id)
    if not facility:
        raise ValueError("Facility not found")

    room = Room(
        tenant_id=tenant_id,
        facility_id=data.facility_id,
        room_number=data.room_number,
        type=data.type,
    )
    session.add(room)
    await session.flush()

    return room


async def get_room(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    room_id: uuid.UUID,
) -> Optional[Room]:
    result = await session.execute(
        select(Room)
        .where(
            and_(
                Room.id == room_id,
                Room.tenant_id == tenant_id,
                Room.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_room_status(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    room_id: uuid.UUID,
    data: RoomUpdate,
) -> Optional[Room]:
    room = await get_room(session, tenant_id, room_id)
    if not room:
        return None

    if room.status != data.status:
        room.status = data.status
        room.updated_at = datetime.now(timezone.utc)
        await session.flush()

        await publish_event(
            "ROOM_UPDATED",
            tenant_id=tenant_id,
            entity_id=room.id,
            payload={"status": room.status, "room_number": room.room_number},
        )

    return room


# ── Assets ──────────────────────────────────────────────────────
async def create_asset(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: AssetCreate,
) -> Asset:
    asset = Asset(
        tenant_id=tenant_id,
        name=data.name,
        category=data.category,
        location=data.location,
    )
    session.add(asset)
    await session.flush()

    await publish_event(
        "ASSET_REGISTERED",
        tenant_id=tenant_id,
        entity_id=asset.id,
        payload={"name": asset.name, "category": asset.category},
    )

    return asset


async def get_asset(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    asset_id: uuid.UUID,
) -> Optional[Asset]:
    result = await session.execute(
        select(Asset)
        .where(
            and_(
                Asset.id == asset_id,
                Asset.tenant_id == tenant_id,
                Asset.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_asset_status(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    asset_id: uuid.UUID,
    data: AssetUpdate,
) -> Optional[Asset]:
    asset = await get_asset(session, tenant_id, asset_id)
    if not asset:
        return None

    if asset.status != data.status:
        asset.status = data.status
        asset.updated_at = datetime.now(timezone.utc)
        await session.flush()

    return asset


# ── Maintenance Requests ────────────────────────────────────────
async def create_maintenance_request(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: MaintenanceRequestCreate,
) -> MaintenanceRequest:
    asset = await get_asset(session, tenant_id, data.asset_id)
    if not asset:
        raise ValueError("Asset not found")

    req = MaintenanceRequest(
        tenant_id=tenant_id,
        asset_id=data.asset_id,
        issue_description=data.issue_description,
    )
    session.add(req)
    
    # Auto degrade asset
    if asset.status == "operational":
        asset.status = "degraded"
        
    await session.flush()

    await publish_event(
        "MAINTENANCE_REQUEST_CREATED",
        tenant_id=tenant_id,
        entity_id=req.id,
        payload={"asset_id": str(asset.id)},
    )

    return req


async def get_maintenance_request(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    request_id: uuid.UUID,
) -> Optional[MaintenanceRequest]:
    result = await session.execute(
        select(MaintenanceRequest)
        .where(
            and_(
                MaintenanceRequest.id == request_id,
                MaintenanceRequest.tenant_id == tenant_id,
                MaintenanceRequest.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_maintenance_request(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    request_id: uuid.UUID,
    data: MaintenanceRequestUpdate,
) -> Optional[MaintenanceRequest]:
    req = await get_maintenance_request(session, tenant_id, request_id)
    if not req:
        return None

    if req.status != data.status:
        req.status = data.status
        req.updated_at = datetime.now(timezone.utc)
        
        if data.status == "resolved":
            req.resolved_at = datetime.now(timezone.utc)
            
            # Auto restore asset status
            asset = await get_asset(session, tenant_id, req.asset_id)
            if asset and asset.status in ("degraded", "offline"):
                asset.status = "operational"

            await publish_event(
                "MAINTENANCE_COMPLETED",
                tenant_id=tenant_id,
                entity_id=req.id,
                payload={"asset_id": str(req.asset_id)},
            )
            
        await session.flush()

    return req


# ── Maintenance Schedules ───────────────────────────────────────
async def create_maintenance_schedule(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: MaintenanceScheduleCreate,
) -> MaintenanceSchedule:
    asset = await get_asset(session, tenant_id, data.asset_id)
    if not asset:
        raise ValueError("Asset not found")

    sched = MaintenanceSchedule(
        tenant_id=tenant_id,
        asset_id=data.asset_id,
        schedule_type=data.schedule_type,
        next_due=data.next_due,
    )
    session.add(sched)
    await session.flush()

    return sched


async def get_maintenance_schedule(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    schedule_id: uuid.UUID,
) -> Optional[MaintenanceSchedule]:
    result = await session.execute(
        select(MaintenanceSchedule)
        .where(
            and_(
                MaintenanceSchedule.id == schedule_id,
                MaintenanceSchedule.tenant_id == tenant_id,
                MaintenanceSchedule.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()
