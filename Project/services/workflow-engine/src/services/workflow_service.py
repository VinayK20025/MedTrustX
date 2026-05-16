"""
MedTrustX Workflow Engine — Business Logic Layer

Workflows, definitions, instances, tasks, and state transitions.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.workflow import (
    Task,
    Transition,
    Workflow,
    WorkflowDefinition,
    WorkflowInstance,
)
from src.schemas.workflow import (
    TaskCreate,
    TransitionCreate,
    WorkflowCreate,
    WorkflowDefinitionCreate,
    WorkflowInstanceCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Workflows ──

async def create_workflow(
    session: AsyncSession, tenant_id: uuid.UUID, data: WorkflowCreate
) -> Workflow:
    workflow = Workflow(tenant_id=tenant_id, name=data.name)
    session.add(workflow)
    await session.flush()
    return workflow


async def get_workflow(
    session: AsyncSession, tenant_id: uuid.UUID, workflow_id: uuid.UUID
) -> Optional[Workflow]:
    result = await session.execute(
        select(Workflow).where(and_(Workflow.id == workflow_id, Workflow.tenant_id == tenant_id, Workflow.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Definitions ──

async def create_definition(
    session: AsyncSession, tenant_id: uuid.UUID, data: WorkflowDefinitionCreate
) -> WorkflowDefinition:
    definition = WorkflowDefinition(
        tenant_id=tenant_id,
        workflow_id=data.workflow_id,
        definition=data.definition,
        version=data.version,
    )
    session.add(definition)
    await session.flush()
    return definition


# ── Instances ──

async def create_instance(
    session: AsyncSession, tenant_id: uuid.UUID, data: WorkflowInstanceCreate
) -> WorkflowInstance:
    instance = WorkflowInstance(
        tenant_id=tenant_id,
        workflow_id=data.workflow_id,
        state=data.initial_state,
    )
    session.add(instance)
    await session.flush()
    await publish_event("WORKFLOW_STARTED", tenant_id, instance.id, {"workflow_id": str(data.workflow_id)})
    return instance


async def get_instance(
    session: AsyncSession, tenant_id: uuid.UUID, instance_id: uuid.UUID
) -> Optional[WorkflowInstance]:
    result = await session.execute(
        select(WorkflowInstance).where(and_(WorkflowInstance.id == instance_id, WorkflowInstance.tenant_id == tenant_id, WorkflowInstance.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Tasks ──

async def create_task(
    session: AsyncSession, tenant_id: uuid.UUID, data: TaskCreate
) -> Task:
    task = Task(
        tenant_id=tenant_id,
        instance_id=data.instance_id,
        task_type=data.task_type,
        assigned_to=data.assigned_to,
    )
    session.add(task)
    await session.flush()
    await publish_event("TASK_CREATED", tenant_id, task.id, {"instance_id": str(data.instance_id), "type": data.task_type})
    return task


async def complete_task(
    session: AsyncSession, tenant_id: uuid.UUID, task_id: uuid.UUID
) -> Optional[Task]:
    result = await session.execute(
        select(Task).where(and_(Task.id == task_id, Task.tenant_id == tenant_id, Task.deleted_at.is_(None)))
    )
    task = result.scalar_one_or_none()
    if not task:
        return None
    task.status = "completed"
    await session.flush()
    await publish_event("TASK_COMPLETED", tenant_id, task.id, {"instance_id": str(task.instance_id)})
    return task


# ── Transitions ──

async def transition_instance(
    session: AsyncSession, tenant_id: uuid.UUID, data: TransitionCreate
) -> Optional[Transition]:
    instance = await get_instance(session, tenant_id, data.instance_id)
    if not instance:
        return None

    transition = Transition(
        tenant_id=tenant_id,
        instance_id=data.instance_id,
        from_state=instance.state,
        to_state=data.to_state,
    )
    session.add(transition)
    
    instance.state = data.to_state
    if data.to_state in ("completed", "failed", "cancelled"):
        instance.completed_at = datetime.now(timezone.utc)
        await publish_event("WORKFLOW_COMPLETED", tenant_id, instance.id, {"status": data.to_state})

    await session.flush()
    return transition
