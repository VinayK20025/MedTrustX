"""
MedTrustX Care Coordination Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.coordination import (
    CareEvent,
    CarePlan,
    CareTask,
    CareWorkflow,
)
from src.schemas.coordination import (
    CarePlanCreate,
    CarePlanUpdate,
    CareTaskCreate,
    CareTaskUpdate,
    CareWorkflowCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Care Plans ──────────────────────────────────────────────────
async def create_care_plan(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: CarePlanCreate,
) -> CarePlan:
    plan = CarePlan(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        plan_name=data.plan_name,
    )
    session.add(plan)
    await session.flush()

    # Log internal event
    event = CareEvent(
        tenant_id=tenant_id,
        care_plan_id=plan.id,
        event_type="plan_created",
        description=f"Care plan '{data.plan_name}' initialized.",
    )
    session.add(event)

    await publish_event(
        "CARE_PLAN_CREATED",
        tenant_id=tenant_id,
        care_plan_id=plan.id,
        payload={"patient_id": str(data.patient_id), "plan_name": data.plan_name},
    )
    return plan


async def get_care_plan(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    plan_id: uuid.UUID,
) -> Optional[CarePlan]:
    result = await session.execute(
        select(CarePlan)
        .where(
            and_(
                CarePlan.id == plan_id,
                CarePlan.tenant_id == tenant_id,
                CarePlan.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def get_patient_care_plans(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[CarePlan]:
    result = await session.execute(
        select(CarePlan)
        .where(
            and_(
                CarePlan.patient_id == patient_id,
                CarePlan.tenant_id == tenant_id,
                CarePlan.deleted_at.is_(None),
            )
        )
        .order_by(desc(CarePlan.created_at))
    )
    return list(result.scalars().all())


async def update_care_plan(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    plan_id: uuid.UUID,
    data: CarePlanUpdate,
) -> Optional[CarePlan]:
    plan = await get_care_plan(session, tenant_id, plan_id)
    if not plan:
        return None

    if data.status != plan.status:
        plan.status = data.status
        plan.updated_at = datetime.now(timezone.utc)
        
        event = CareEvent(
            tenant_id=tenant_id,
            care_plan_id=plan.id,
            event_type="plan_updated",
            description=f"Status changed to {data.status}.",
        )
        session.add(event)
        await session.flush()

        await publish_event(
            "CARE_PLAN_UPDATED",
            tenant_id=tenant_id,
            care_plan_id=plan.id,
            payload={"status": data.status},
        )

    return plan


# ── Care Tasks ──────────────────────────────────────────────────
async def add_task(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    plan_id: uuid.UUID,
    data: CareTaskCreate,
) -> Optional[CareTask]:
    plan = await get_care_plan(session, tenant_id, plan_id)
    if not plan:
        return None

    task = CareTask(
        tenant_id=tenant_id,
        care_plan_id=plan_id,
        task_name=data.task_name,
        assigned_to=data.assigned_to,
        due_time=data.due_time,
    )
    session.add(task)
    await session.flush()

    event = CareEvent(
        tenant_id=tenant_id,
        care_plan_id=plan.id,
        event_type="task_created",
        description=f"Task '{data.task_name}' created.",
    )
    session.add(event)

    if data.assigned_to:
        await publish_event(
            "CARE_TASK_ASSIGNED",
            tenant_id=tenant_id,
            care_plan_id=plan.id,
            payload={"task_id": str(task.id), "assigned_to": str(data.assigned_to)},
        )

    return task


async def get_plan_tasks(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    plan_id: uuid.UUID,
) -> List[CareTask]:
    result = await session.execute(
        select(CareTask)
        .where(
            and_(
                CareTask.care_plan_id == plan_id,
                CareTask.tenant_id == tenant_id,
                CareTask.deleted_at.is_(None),
            )
        )
        .order_by(CareTask.due_time)
    )
    return list(result.scalars().all())


async def update_task(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    task_id: uuid.UUID,
    data: CareTaskUpdate,
) -> Optional[CareTask]:
    result = await session.execute(
        select(CareTask).where(
            and_(
                CareTask.id == task_id,
                CareTask.tenant_id == tenant_id,
                CareTask.deleted_at.is_(None),
            )
        )
    )
    task = result.scalar_one_or_none()
    if not task:
        return None

    if data.assigned_to is not None and data.assigned_to != task.assigned_to:
        task.assigned_to = data.assigned_to
        await publish_event(
            "CARE_TASK_ASSIGNED",
            tenant_id=tenant_id,
            care_plan_id=task.care_plan_id,
            payload={"task_id": str(task.id), "assigned_to": str(data.assigned_to)},
        )

    if data.status is not None and data.status != task.status:
        task.status = data.status
        if data.status == "completed":
            task.completed_at = datetime.now(timezone.utc)
            
            event = CareEvent(
                tenant_id=tenant_id,
                care_plan_id=task.care_plan_id,
                event_type="task_completed",
                description=f"Task '{task.task_name}' completed.",
            )
            session.add(event)
            
            await publish_event(
                "CARE_TASK_COMPLETED",
                tenant_id=tenant_id,
                care_plan_id=task.care_plan_id,
                payload={"task_id": str(task.id)},
            )

    task.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return task


# ── Care Workflows ──────────────────────────────────────────────
async def create_workflow(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: CareWorkflowCreate,
) -> CareWorkflow:
    workflow = CareWorkflow(
        tenant_id=tenant_id,
        workflow_name=data.workflow_name,
        definition=data.definition,
        active=data.active,
    )
    session.add(workflow)
    await session.flush()
    return workflow


async def get_workflow(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    workflow_id: uuid.UUID,
) -> Optional[CareWorkflow]:
    result = await session.execute(
        select(CareWorkflow)
        .where(
            and_(
                CareWorkflow.id == workflow_id,
                CareWorkflow.tenant_id == tenant_id,
                CareWorkflow.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()
