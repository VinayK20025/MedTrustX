"""
MedTrustX Clinical Research Service — Business Logic Layer

CRUD operations for studies, participants, cohorts, and research data.
Includes study-event logging for full audit trail and lifecycle management.
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.research import (
    Cohort,
    ResearchData,
    Study,
    StudyEvent,
    StudyParticipant,
)
from src.schemas.research import (
    CohortCreateRequest,
    ParticipantEnrollRequest,
    ResearchDataCollectRequest,
    StudyCreateRequest,
    StudyUpdateRequest,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Helper: record study event ──

async def _record_event(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    study_id: uuid.UUID,
    event_type: str,
    payload: Dict[str, Any] | None = None,
) -> None:
    evt = StudyEvent(
        tenant_id=tenant_id,
        study_id=study_id,
        event_type=event_type,
        payload=payload or {},
    )
    session.add(evt)
    await session.flush()
    await publish_event(event_type, tenant_id, study_id, payload)


# ── Studies ──

async def create_study(
    session: AsyncSession, tenant_id: uuid.UUID, data: StudyCreateRequest
) -> Study:
    study = Study(
        tenant_id=tenant_id,
        name=data.name,
        study_type=data.study_type,
        status="draft",
        protocol=data.protocol,
    )
    session.add(study)
    await session.flush()
    await _record_event(session, tenant_id, study.id, "STUDY_CREATED", {"name": data.name})
    return study


async def get_study(
    session: AsyncSession, tenant_id: uuid.UUID, study_id: uuid.UUID
) -> Optional[Study]:
    result = await session.execute(
        select(Study).where(
            and_(Study.id == study_id, Study.tenant_id == tenant_id, Study.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def update_study(
    session: AsyncSession, tenant_id: uuid.UUID, study_id: uuid.UUID, data: StudyUpdateRequest
) -> Optional[Study]:
    study = await get_study(session, tenant_id, study_id)
    if not study:
        return None

    changes: Dict[str, Any] = {}
    if data.name is not None:
        study.name = data.name
        changes["name"] = data.name
    if data.status is not None:
        study.status = data.status
        changes["status"] = data.status
    if data.start_date is not None:
        study.start_date = data.start_date
        changes["start_date"] = data.start_date.isoformat()
    if data.end_date is not None:
        study.end_date = data.end_date
        changes["end_date"] = data.end_date.isoformat()
    if data.protocol is not None:
        study.protocol = data.protocol
        changes["protocol_updated"] = True

    await session.flush()

    event_type = "STUDY_COMPLETED" if data.status == "completed" else "STUDY_UPDATED"
    await _record_event(session, tenant_id, study_id, event_type, changes)
    return study


# ── Participants ──

async def enroll_participant(
    session: AsyncSession, tenant_id: uuid.UUID, study_id: uuid.UUID, data: ParticipantEnrollRequest
) -> StudyParticipant:
    participant = StudyParticipant(
        tenant_id=tenant_id,
        study_id=study_id,
        patient_id=data.patient_id,
        status="enrolled",
    )
    session.add(participant)
    await session.flush()
    await _record_event(
        session, tenant_id, study_id, "PARTICIPANT_ENROLLED",
        {"patient_id": str(data.patient_id)},
    )
    return participant


async def get_participants(
    session: AsyncSession, tenant_id: uuid.UUID, study_id: uuid.UUID
) -> List[StudyParticipant]:
    result = await session.execute(
        select(StudyParticipant).where(
            and_(
                StudyParticipant.tenant_id == tenant_id,
                StudyParticipant.study_id == study_id,
                StudyParticipant.deleted_at.is_(None),
            )
        )
    )
    return list(result.scalars().all())


# ── Cohorts ──

async def create_cohort(
    session: AsyncSession, tenant_id: uuid.UUID, data: CohortCreateRequest
) -> Cohort:
    cohort = Cohort(
        tenant_id=tenant_id,
        name=data.name,
        criteria=data.criteria,
    )
    session.add(cohort)
    await session.flush()
    return cohort


async def get_cohort(
    session: AsyncSession, tenant_id: uuid.UUID, cohort_id: uuid.UUID
) -> Optional[Cohort]:
    result = await session.execute(
        select(Cohort).where(
            and_(Cohort.id == cohort_id, Cohort.tenant_id == tenant_id, Cohort.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── Research Data ──

async def collect_data(
    session: AsyncSession, tenant_id: uuid.UUID, data: ResearchDataCollectRequest
) -> ResearchData:
    rd = ResearchData(
        tenant_id=tenant_id,
        study_id=data.study_id,
        patient_id=data.patient_id,
        data=data.data,
    )
    session.add(rd)
    await session.flush()
    await _record_event(
        session, tenant_id, data.study_id, "DATA_COLLECTED",
        {"patient_id": str(data.patient_id)},
    )
    return rd


async def get_research_data(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[ResearchData]:
    result = await session.execute(
        select(ResearchData)
        .where(and_(ResearchData.tenant_id == tenant_id, ResearchData.deleted_at.is_(None)))
        .order_by(desc(ResearchData.collected_at))
        .limit(limit)
    )
    return list(result.scalars().all())


# ── Study Events ──

async def get_study_events(
    session: AsyncSession, tenant_id: uuid.UUID, study_id: uuid.UUID, limit: int = 50
) -> List[StudyEvent]:
    result = await session.execute(
        select(StudyEvent)
        .where(
            and_(
                StudyEvent.tenant_id == tenant_id,
                StudyEvent.study_id == study_id,
                StudyEvent.deleted_at.is_(None),
            )
        )
        .order_by(desc(StudyEvent.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())
