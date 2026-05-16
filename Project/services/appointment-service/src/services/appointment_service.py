"""
MedTrustX Appointments Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
import structlog

from src.models.appointments import (
    Appointment,
    Queue,
    Schedule,
    Slot,
)
from src.schemas.appointments import (
    AppointmentCreate,
    AppointmentUpdate,
    ScheduleCreate,
    ScheduleUpdate,
    SlotCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Schedules ───────────────────────────────────────────────────
async def create_schedule(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: ScheduleCreate,
) -> Schedule:
    schedule = Schedule(
        tenant_id=tenant_id,
        doctor_id=data.doctor_id,
        day_of_week=data.day_of_week,
        start_time=data.start_time,
        end_time=data.end_time,
        slot_duration=data.slot_duration,
    )
    session.add(schedule)
    await session.flush()
    return schedule


async def get_schedule(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    schedule_id: uuid.UUID,
) -> Optional[Schedule]:
    result = await session.execute(
        select(Schedule)
        .where(
            and_(
                Schedule.id == schedule_id,
                Schedule.tenant_id == tenant_id,
                Schedule.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_schedule(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    schedule_id: uuid.UUID,
    data: ScheduleUpdate,
) -> Optional[Schedule]:
    schedule = await get_schedule(session, tenant_id, schedule_id)
    if not schedule:
        return None

    if data.start_time is not None:
        schedule.start_time = data.start_time
    if data.end_time is not None:
        schedule.end_time = data.end_time
    if data.slot_duration is not None:
        schedule.slot_duration = data.slot_duration

    schedule.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return schedule


# ── Slots ───────────────────────────────────────────────────────
async def create_slot(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: SlotCreate,
) -> Slot:
    slot = Slot(
        tenant_id=tenant_id,
        schedule_id=data.schedule_id,
        start_time=data.start_time,
        end_time=data.end_time,
        status=data.status,
    )
    session.add(slot)
    await session.flush()
    return slot


async def get_doctor_slots(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    doctor_id: uuid.UUID,
) -> List[Slot]:
    """
    Find all available slots for a specific doctor.
    """
    result = await session.execute(
        select(Slot)
        .join(Schedule)
        .where(
            and_(
                Schedule.doctor_id == doctor_id,
                Slot.tenant_id == tenant_id,
                Slot.status == "available",
                Slot.start_time >= datetime.now(timezone.utc),
                Slot.deleted_at.is_(None),
            )
        )
        .order_by(Slot.start_time)
    )
    return list(result.scalars().all())


# ── Appointments ────────────────────────────────────────────────
async def book_appointment(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: AppointmentCreate,
) -> Appointment:
    # 1. Optimistic Locking: Attempt to claim the slot
    # We update the slot status to 'booked' only if it is currently 'available'.
    # If no rows are updated, someone else booked it (or it doesn't exist).
    stmt = (
        update(Slot)
        .where(
            and_(
                Slot.id == data.slot_id,
                Slot.tenant_id == tenant_id,
                Slot.status == "available",
            )
        )
        .values(status="booked")
    )
    
    result = await session.execute(stmt)
    if result.rowcount == 0:
        raise ValueError("Slot is unavailable or already booked")

    # 2. Create the Appointment
    appt = Appointment(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        doctor_id=data.doctor_id,
        slot_id=data.slot_id,
        reason=data.reason,
    )
    session.add(appt)
    
    try:
        await session.flush()
    except IntegrityError:
        # Failsafe for unique constraint on slot_id
        await session.rollback()
        raise ValueError("Slot double-booking detected")

    await publish_event(
        "APPOINTMENT_CREATED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={
            "appointment_id": str(appt.id),
            "doctor_id": str(data.doctor_id),
            "slot_id": str(data.slot_id),
        },
    )

    return appt


async def get_appointment(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    appointment_id: uuid.UUID,
) -> Optional[Appointment]:
    result = await session.execute(
        select(Appointment)
        .where(
            and_(
                Appointment.id == appointment_id,
                Appointment.tenant_id == tenant_id,
                Appointment.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_appointment_status(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    appointment_id: uuid.UUID,
    data: AppointmentUpdate,
) -> Optional[Appointment]:
    appt = await get_appointment(session, tenant_id, appointment_id)
    if not appt:
        return None

    old_status = appt.status
    if data.status != old_status:
        appt.status = data.status
        appt.updated_at = datetime.now(timezone.utc)

        # If cancelled, free up the slot
        if data.status == "cancelled":
            stmt = (
                update(Slot)
                .where(Slot.id == appt.slot_id)
                .values(status="available")
            )
            await session.execute(stmt)
            
            await publish_event(
                "APPOINTMENT_CANCELLED",
                tenant_id=tenant_id,
                patient_id=appt.patient_id,
                payload={"appointment_id": str(appt.id), "doctor_id": str(appt.doctor_id)},
            )
        
        # If checked in, create a queue entry
        elif data.status == "checked_in":
            # Get max queue position for this doctor today
            q_result = await session.execute(
                select(Queue)
                .join(Appointment)
                .where(
                    and_(
                        Appointment.doctor_id == appt.doctor_id,
                        Queue.tenant_id == tenant_id,
                        Queue.status == "waiting",
                    )
                )
            )
            existing_queues = q_result.scalars().all()
            next_pos = len(existing_queues) + 1

            queue = Queue(
                tenant_id=tenant_id,
                appointment_id=appt.id,
                queue_position=next_pos,
            )
            session.add(queue)

            await publish_event(
                "QUEUE_UPDATED",
                tenant_id=tenant_id,
                patient_id=appt.patient_id,
                payload={"appointment_id": str(appt.id), "doctor_id": str(appt.doctor_id), "queue_position": next_pos},
            )

        await session.flush()

    return appt


async def get_patient_appointments(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[Appointment]:
    result = await session.execute(
        select(Appointment)
        .where(
            and_(
                Appointment.patient_id == patient_id,
                Appointment.tenant_id == tenant_id,
                Appointment.deleted_at.is_(None),
            )
        )
        .order_by(desc(Appointment.created_at))
    )
    return list(result.scalars().all())


async def delete_appointment(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    appointment_id: uuid.UUID,
) -> bool:
    appt = await get_appointment(session, tenant_id, appointment_id)
    if not appt:
        return False
        
    appt.soft_delete()
    
    # Free the slot
    stmt = (
        update(Slot)
        .where(Slot.id == appt.slot_id)
        .values(status="available")
    )
    await session.execute(stmt)
    await session.flush()

    await publish_event(
        "APPOINTMENT_CANCELLED",
        tenant_id=tenant_id,
        patient_id=appt.patient_id,
        payload={"appointment_id": str(appt.id), "doctor_id": str(appt.doctor_id), "reason": "deleted"},
    )
    return True


# ── Queues ──────────────────────────────────────────────────────
async def get_doctor_queue(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    doctor_id: uuid.UUID,
) -> List[Queue]:
    """
    Get live waitlist for a specific doctor.
    """
    result = await session.execute(
        select(Queue)
        .join(Appointment)
        .where(
            and_(
                Appointment.doctor_id == doctor_id,
                Queue.tenant_id == tenant_id,
                Queue.status == "waiting",
            )
        )
        .order_by(Queue.queue_position)
    )
    return list(result.scalars().all())
