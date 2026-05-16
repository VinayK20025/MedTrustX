"""
MedTrustX OT Management Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, desc, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.ot import OTBooking, OTRoom, Surgery, SurgicalTeam
from src.schemas.ot import (
    OTBookingCreate,
    OTRoomCreate,
    OTRoomUpdate,
    SurgeryCreate,
    SurgeryUpdate,
    SurgicalTeamCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Surgeries ───────────────────────────────────────────────────
async def schedule_surgery(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: SurgeryCreate,
) -> Surgery:
    surgery = Surgery(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        procedure_name=data.procedure_name,
        scheduled_start=data.scheduled_start,
        scheduled_end=data.scheduled_end,
    )
    session.add(surgery)
    await session.flush()

    await publish_event(
        "SURGERY_SCHEDULED",
        tenant_id=tenant_id,
        surgery_id=surgery.id,
        payload={"patient_id": str(data.patient_id), "procedure": data.procedure_name},
    )
    return surgery


async def get_surgery(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    surgery_id: uuid.UUID,
) -> Optional[Surgery]:
    result = await session.execute(
        select(Surgery).where(
            and_(
                Surgery.id == surgery_id,
                Surgery.tenant_id == tenant_id,
                Surgery.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_surgery_status(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    surgery_id: uuid.UUID,
    data: SurgeryUpdate,
) -> Optional[Surgery]:
    surgery = await get_surgery(session, tenant_id, surgery_id)
    if not surgery or not data.status:
        return surgery

    if data.status != surgery.status:
        surgery.status = data.status
        
        if data.status == "in_progress":
            surgery.actual_start = datetime.now(timezone.utc)
            await publish_event(
                "SURGERY_STARTED",
                tenant_id=tenant_id,
                surgery_id=surgery.id,
                payload={"patient_id": str(surgery.patient_id)},
            )
        elif data.status == "completed":
            surgery.actual_end = datetime.now(timezone.utc)
            await publish_event(
                "SURGERY_COMPLETED",
                tenant_id=tenant_id,
                surgery_id=surgery.id,
                payload={"patient_id": str(surgery.patient_id)},
            )
            
            # Automatically release any associated OT Rooms
            await _release_ot_rooms_for_surgery(session, tenant_id, surgery.id)

        surgery.updated_at = datetime.now(timezone.utc)
        await session.flush()

    return surgery


# ── OT Rooms & Bookings ─────────────────────────────────────────
async def add_ot_room(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: OTRoomCreate,
) -> OTRoom:
    room = OTRoom(
        tenant_id=tenant_id,
        name=data.name,
    )
    session.add(room)
    await session.flush()
    return room


async def get_ot_rooms(
    session: AsyncSession,
    tenant_id: uuid.UUID,
) -> List[OTRoom]:
    result = await session.execute(
        select(OTRoom).where(
            and_(
                OTRoom.tenant_id == tenant_id,
                OTRoom.deleted_at.is_(None),
            )
        ).order_by(OTRoom.name)
    )
    return list(result.scalars().all())


async def book_ot_room(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: OTBookingCreate,
) -> OTBooking:
    """Creates a booking after performing conflict detection."""
    
    # 1. Conflict Detection
    conflict_query = select(OTBooking).where(
        and_(
            OTBooking.tenant_id == tenant_id,
            OTBooking.ot_room_id == data.ot_room_id,
            OTBooking.deleted_at.is_(None),
            or_(
                and_(
                    OTBooking.booking_start <= data.booking_start,
                    OTBooking.booking_end > data.booking_start,
                ),
                and_(
                    OTBooking.booking_start < data.booking_end,
                    OTBooking.booking_end >= data.booking_end,
                ),
                and_(
                    OTBooking.booking_start >= data.booking_start,
                    OTBooking.booking_end <= data.booking_end,
                ),
            ),
        )
    )
    conflict = (await session.execute(conflict_query)).scalar_one_or_none()
    
    if conflict:
        raise ValueError("Scheduling conflict: OT room is already booked for this time period.")

    # 2. Create Booking
    booking = OTBooking(
        tenant_id=tenant_id,
        surgery_id=data.surgery_id,
        ot_room_id=data.ot_room_id,
        booking_start=data.booking_start,
        booking_end=data.booking_end,
    )
    session.add(booking)
    await session.flush()
    
    # 3. Mark room status as occupied if booking starts now (simplified logic)
    now = datetime.now(timezone.utc)
    if data.booking_start <= now <= data.booking_end:
        room_result = await session.execute(select(OTRoom).where(OTRoom.id == data.ot_room_id))
        room = room_result.scalar_one_or_none()
        if room:
            room.status = "occupied"

    await publish_event(
        "OT_BOOKED",
        tenant_id=tenant_id,
        surgery_id=data.surgery_id,
        payload={"ot_room_id": str(data.ot_room_id)},
    )

    return booking


async def _release_ot_rooms_for_surgery(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    surgery_id: uuid.UUID,
) -> None:
    """Helper to free up an OT room when a surgery completes."""
    bookings = await session.execute(
        select(OTBooking).where(
            and_(
                OTBooking.surgery_id == surgery_id,
                OTBooking.tenant_id == tenant_id,
            )
        )
    )
    for booking in bookings.scalars().all():
        room_result = await session.execute(select(OTRoom).where(OTRoom.id == booking.ot_room_id))
        room = room_result.scalar_one_or_none()
        if room and room.status == "occupied":
            room.status = "available"
            room.updated_at = datetime.now(timezone.utc)
            
            await publish_event(
                "OT_RELEASED",
                tenant_id=tenant_id,
                surgery_id=surgery_id,
                payload={"ot_room_id": str(room.id)},
            )


# ── Surgical Teams ──────────────────────────────────────────────
async def assign_team_member(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    surgery_id: uuid.UUID,
    data: SurgicalTeamCreate,
) -> SurgicalTeam:
    team_member = SurgicalTeam(
        tenant_id=tenant_id,
        surgery_id=surgery_id,
        role=data.role,
        staff_id=data.staff_id,
    )
    session.add(team_member)
    await session.flush()
    return team_member


async def get_surgery_team(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    surgery_id: uuid.UUID,
) -> List[SurgicalTeam]:
    result = await session.execute(
        select(SurgicalTeam).where(
            and_(
                SurgicalTeam.surgery_id == surgery_id,
                SurgicalTeam.tenant_id == tenant_id,
                SurgicalTeam.deleted_at.is_(None),
            )
        )
    )
    return list(result.scalars().all())
