"""
MedTrustX Case Management Service — Business Logic Layer

Cases, care plans, tasks, notes, and outcomes.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.case_management import (
    CarePlan,
    Case,
    CaseNote,
    CaseOutcome,
    CaseTask,
)
from src.schemas.case_management import (
    CarePlanCreate,
    CaseCreate,
    CaseNoteCreate,
    CaseOutcomeCreate,
    CaseTaskCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Cases ──

async def create_case(
    session: AsyncSession, tenant_id: uuid.UUID, data: CaseCreate
) -> Case:
    case = Case(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        case_type=data.case_type,
    )
    session.add(case)
    await session.flush()
    await publish_event("CASE_CREATED", tenant_id, case.id, {"patient_id": str(data.patient_id), "case_type": data.case_type})
    return case


async def get_case(
    session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID
) -> Optional[Case]:
    result = await session.execute(
        select(Case).where(and_(Case.id == case_id, Case.tenant_id == tenant_id, Case.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Care Plans ──

async def create_care_plan(
    session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID, data: CarePlanCreate
) -> CarePlan:
    plan = CarePlan(
        tenant_id=tenant_id,
        case_id=case_id,
        plan_details=data.plan_details,
    )
    session.add(plan)
    await session.flush()
    await publish_event("CARE_PLAN_CREATED", tenant_id, plan.id, {"case_id": str(case_id)})
    return plan


async def get_care_plans(
    session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID
) -> List[CarePlan]:
    result = await session.execute(
        select(CarePlan).where(and_(CarePlan.case_id == case_id, CarePlan.tenant_id == tenant_id, CarePlan.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Case Tasks ──

async def assign_task(
    session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID, data: CaseTaskCreate
) -> CaseTask:
    task = CaseTask(
        tenant_id=tenant_id,
        case_id=case_id,
        task_type=data.task_type,
        assigned_to=data.assigned_to,
        due_date=data.due_date,
    )
    session.add(task)
    await session.flush()
    await publish_event("TASK_ASSIGNED", tenant_id, task.id, {"case_id": str(case_id), "assigned_to": str(data.assigned_to), "task_type": data.task_type})
    return task


async def get_tasks(
    session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID
) -> List[CaseTask]:
    result = await session.execute(
        select(CaseTask).where(and_(CaseTask.case_id == case_id, CaseTask.tenant_id == tenant_id, CaseTask.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Case Notes ──

async def add_note(
    session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID, data: CaseNoteCreate
) -> CaseNote:
    note = CaseNote(
        tenant_id=tenant_id,
        case_id=case_id,
        note=data.note,
        created_by=data.created_by,
    )
    session.add(note)
    await session.flush()
    return note


# ── Case Outcomes ──

async def record_outcome(
    session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID, data: CaseOutcomeCreate
) -> CaseOutcome:
    outcome = CaseOutcome(
        tenant_id=tenant_id,
        case_id=case_id,
        outcome_type=data.outcome_type,
        value=data.value,
    )
    session.add(outcome)
    await session.flush()
    await publish_event("OUTCOME_RECORDED", tenant_id, outcome.id, {"case_id": str(case_id), "outcome_type": data.outcome_type})
    return outcome


async def get_outcomes(
    session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID
) -> List[CaseOutcome]:
    result = await session.execute(
        select(CaseOutcome).where(and_(CaseOutcome.case_id == case_id, CaseOutcome.tenant_id == tenant_id, CaseOutcome.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
