"""
MedTrustX Clinical Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from sqlalchemy import and_, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.clinical import ClinicalNote, Diagnosis, Encounter, Observation
from src.schemas.clinical import (
    ClinicalNoteCreate,
    DiagnosisCreate,
    EncounterCreate,
    EncounterUpdate,
    ObservationCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Encounters ──────────────────────────────────────────────────
async def create_encounter(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: EncounterCreate,
) -> Encounter:
    encounter = Encounter(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_type=data.encounter_type,
        attending_physician=data.attending_physician,
    )
    session.add(encounter)
    await session.flush()

    logger.info(
        "encounter_created",
        encounter_id=str(encounter.id),
        patient_id=str(data.patient_id),
        tenant_id=str(tenant_id),
    )

    await publish_event(
        "ENCOUNTER_CREATED",
        patient_id=data.patient_id,
        tenant_id=tenant_id,
        encounter_id=encounter.id,
        payload={"encounter_type": data.encounter_type},
    )
    return encounter


async def get_encounter(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    encounter_id: uuid.UUID,
    load_relations: bool = False,
) -> Optional[Encounter]:
    stmt = select(Encounter).where(
        and_(
            Encounter.id == encounter_id,
            Encounter.tenant_id == tenant_id,
            Encounter.deleted_at.is_(None),
        )
    )
    if load_relations:
        stmt = stmt.options(
            selectinload(Encounter.notes),
            selectinload(Encounter.diagnoses),
            selectinload(Encounter.observations),
        )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def update_encounter(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    encounter_id: uuid.UUID,
    data: EncounterUpdate,
) -> Optional[Encounter]:
    encounter = await get_encounter(session, tenant_id, encounter_id)
    if not encounter:
        return None

    update_data = data.model_dump(exclude_unset=True)
    if "status" in update_data and update_data["status"] != encounter.status:
        encounter.status = update_data["status"]
        if encounter.status in ("closed", "cancelled"):
            encounter.ended_at = datetime.now(timezone.utc)
            await publish_event(
                "ENCOUNTER_CLOSED",
                patient_id=encounter.patient_id,
                tenant_id=tenant_id,
                encounter_id=encounter.id,
                payload={"status": encounter.status},
            )

    if "attending_physician" in update_data:
        encounter.attending_physician = update_data["attending_physician"]

    encounter.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return encounter


# ── Clinical Notes ──────────────────────────────────────────────
async def add_clinical_note(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    encounter_id: uuid.UUID,
    user_id: uuid.UUID,
    data: ClinicalNoteCreate,
) -> Optional[ClinicalNote]:
    encounter = await get_encounter(session, tenant_id, encounter_id)
    if not encounter:
        return None

    note = ClinicalNote(
        tenant_id=tenant_id,
        encounter_id=encounter_id,
        patient_id=encounter.patient_id,
        subjective=data.subjective,
        objective=data.objective,
        assessment=data.assessment,
        plan=data.plan,
        created_by=user_id,
    )
    session.add(note)
    await session.flush()

    await publish_event(
        "CLINICAL_NOTE_ADDED",
        patient_id=encounter.patient_id,
        tenant_id=tenant_id,
        encounter_id=encounter_id,
        payload={"note_id": str(note.id)},
    )
    return note


async def list_notes(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    encounter_id: uuid.UUID,
) -> List[ClinicalNote]:
    result = await session.execute(
        select(ClinicalNote).where(
            and_(
                ClinicalNote.encounter_id == encounter_id,
                ClinicalNote.tenant_id == tenant_id,
                ClinicalNote.deleted_at.is_(None),
            )
        ).order_by(desc(ClinicalNote.created_at))
    )
    return list(result.scalars().all())


# ── Diagnoses ───────────────────────────────────────────────────
async def add_diagnosis(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    encounter_id: uuid.UUID,
    user_id: uuid.UUID,
    data: DiagnosisCreate,
) -> Optional[Diagnosis]:
    encounter = await get_encounter(session, tenant_id, encounter_id)
    if not encounter:
        return None

    diagnosis = Diagnosis(
        tenant_id=tenant_id,
        encounter_id=encounter_id,
        patient_id=encounter.patient_id,
        icd_code=data.icd_code,
        description=data.description,
        type=data.type,
        status=data.status,
        created_by=user_id,
    )
    session.add(diagnosis)
    await session.flush()

    await publish_event(
        "DIAGNOSIS_ADDED",
        patient_id=encounter.patient_id,
        tenant_id=tenant_id,
        encounter_id=encounter_id,
        payload={"icd_code": data.icd_code, "diagnosis_id": str(diagnosis.id)},
    )
    return diagnosis


async def list_diagnoses(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    encounter_id: uuid.UUID,
) -> List[Diagnosis]:
    result = await session.execute(
        select(Diagnosis).where(
            and_(
                Diagnosis.encounter_id == encounter_id,
                Diagnosis.tenant_id == tenant_id,
                Diagnosis.deleted_at.is_(None),
            )
        ).order_by(desc(Diagnosis.created_at))
    )
    return list(result.scalars().all())


# ── Observations ────────────────────────────────────────────────
async def add_observation(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    encounter_id: uuid.UUID,
    user_id: uuid.UUID,
    data: ObservationCreate,
) -> Optional[Observation]:
    encounter = await get_encounter(session, tenant_id, encounter_id)
    if not encounter:
        return None

    observation = Observation(
        tenant_id=tenant_id,
        encounter_id=encounter_id,
        patient_id=encounter.patient_id,
        type=data.type,
        value=data.value,
        unit=data.unit,
        recorded_at=data.recorded_at or datetime.now(timezone.utc),
        created_by=user_id,
    )
    session.add(observation)
    await session.flush()

    await publish_event(
        "OBSERVATION_RECORDED",
        patient_id=encounter.patient_id,
        tenant_id=tenant_id,
        encounter_id=encounter_id,
        payload={"type": data.type, "value": data.value, "unit": data.unit},
    )
    return observation


async def list_observations(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    encounter_id: uuid.UUID,
) -> List[Observation]:
    result = await session.execute(
        select(Observation).where(
            and_(
                Observation.encounter_id == encounter_id,
                Observation.tenant_id == tenant_id,
                Observation.deleted_at.is_(None),
            )
        ).order_by(desc(Observation.recorded_at))
    )
    return list(result.scalars().all())


# ── Patient History ─────────────────────────────────────────────
async def get_patient_history(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[Encounter]:
    """Retrieve full longitudinal history for a patient."""
    result = await session.execute(
        select(Encounter)
        .where(
            and_(
                Encounter.patient_id == patient_id,
                Encounter.tenant_id == tenant_id,
                Encounter.deleted_at.is_(None),
            )
        )
        .options(
            selectinload(Encounter.notes),
            selectinload(Encounter.diagnoses),
            selectinload(Encounter.observations),
        )
        .order_by(desc(Encounter.started_at))
    )
    return list(result.scalars().all())
