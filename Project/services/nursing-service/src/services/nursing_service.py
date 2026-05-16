"""
MedTrustX Nursing Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.nursing import NursingNote, NursingTask, ShiftHandover, Vitals
from src.schemas.nursing import (
    NursingNoteCreate,
    NursingTaskCreate,
    NursingTaskUpdate,
    ShiftHandoverCreate,
    VitalsCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Nursing Tasks ───────────────────────────────────────────────
async def create_task(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: NursingTaskCreate,
) -> NursingTask:
    task = NursingTask(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        task_type=data.task_type,
        description=data.description,
        assigned_to=data.assigned_to,
        due_time=data.due_time,
    )
    session.add(task)
    await session.flush()

    await publish_event(
        "NURSING_TASK_CREATED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={"task_id": str(task.id), "task_type": data.task_type},
    )
    return task


async def get_task(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    task_id: uuid.UUID,
) -> Optional[NursingTask]:
    result = await session.execute(
        select(NursingTask).where(
            and_(
                NursingTask.id == task_id,
                NursingTask.tenant_id == tenant_id,
                NursingTask.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_task(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    task_id: uuid.UUID,
    user_id: uuid.UUID,
    data: NursingTaskUpdate,
) -> Optional[NursingTask]:
    task = await get_task(session, tenant_id, task_id)
    if not task:
        return None

    if data.assigned_to:
        task.assigned_to = data.assigned_to

    if data.status and data.status != task.status:
        task.status = data.status
        if data.status == "completed":
            task.completed_at = datetime.now(timezone.utc)
            task.completed_by = user_id
            
            await publish_event(
                "NURSING_TASK_COMPLETED",
                tenant_id=tenant_id,
                patient_id=task.patient_id,
                payload={"task_id": str(task.id)},
            )

    task.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return task


# ── Vitals ──────────────────────────────────────────────────────
async def record_vitals(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    user_id: uuid.UUID,
    data: VitalsCreate,
) -> Vitals:
    vital = Vitals(
        tenant_id=tenant_id,
        patient_id=patient_id,
        type=data.type,
        value=data.value,
        unit=data.unit,
        recorded_by=user_id,
    )
    session.add(vital)
    await session.flush()

    await publish_event(
        "VITALS_RECORDED",
        tenant_id=tenant_id,
        patient_id=patient_id,
        payload={"type": data.type, "value": data.value, "unit": data.unit},
    )
    return vital


async def get_patient_vitals(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[Vitals]:
    result = await session.execute(
        select(Vitals)
        .where(
            and_(
                Vitals.patient_id == patient_id,
                Vitals.tenant_id == tenant_id,
                Vitals.deleted_at.is_(None),
            )
        )
        .order_by(desc(Vitals.recorded_at))
    )
    return list(result.scalars().all())


# ── Nursing Notes ───────────────────────────────────────────────
async def add_nursing_note(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    data: NursingNoteCreate,
) -> NursingNote:
    note = NursingNote(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        note=data.note,
        created_by=user_id,
    )
    session.add(note)
    await session.flush()
    return note


async def get_patient_notes(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[NursingNote]:
    result = await session.execute(
        select(NursingNote)
        .where(
            and_(
                NursingNote.patient_id == patient_id,
                NursingNote.tenant_id == tenant_id,
                NursingNote.deleted_at.is_(None),
            )
        )
        .order_by(desc(NursingNote.created_at))
    )
    return list(result.scalars().all())


# ── Shift Handovers ─────────────────────────────────────────────
async def add_shift_handover(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    data: ShiftHandoverCreate,
) -> ShiftHandover:
    handover = ShiftHandover(
        tenant_id=tenant_id,
        nurse_id=user_id,
        shift_start=data.shift_start,
        shift_end=data.shift_end,
        notes=data.notes,
    )
    session.add(handover)
    await session.flush()

    await publish_event(
        "SHIFT_HANDOVER_COMPLETED",
        tenant_id=tenant_id,
        payload={"nurse_id": str(user_id)},
    )
    return handover
