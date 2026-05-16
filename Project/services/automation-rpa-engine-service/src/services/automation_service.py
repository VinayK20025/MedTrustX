"""
MedTrustX Automation & RPA Engine Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.automation import Task, Workflow, WorkflowRun
from src.schemas.automation import WorkflowCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Workflows ──

async def create_workflow(session: AsyncSession, tenant_id: uuid.UUID, data: WorkflowCreate) -> Workflow:
    wf = Workflow(tenant_id=tenant_id, name=data.name, definition=data.definition)
    session.add(wf)
    await session.flush()
    return wf


async def get_workflow(session: AsyncSession, tenant_id: uuid.UUID, wf_id: uuid.UUID) -> Workflow | None:
    result = await session.execute(select(Workflow).where(and_(Workflow.id == wf_id, Workflow.tenant_id == tenant_id, Workflow.deleted_at.is_(None))))
    return result.scalar_one_or_none()


# ── Execution ──

async def trigger_workflow(session: AsyncSession, tenant_id: uuid.UUID, wf_id: uuid.UUID) -> WorkflowRun:
    wf = await get_workflow(session, tenant_id, wf_id)
    if not wf:
        raise ValueError("Workflow not found")

    run = WorkflowRun(tenant_id=tenant_id, workflow_id=wf.id, status="running", started_at=datetime.now(timezone.utc))
    session.add(run)
    await session.flush()

    # Create dummy tasks based on definition
    steps = wf.definition.get("steps", [])
    for step in steps:
        task = Task(tenant_id=tenant_id, workflow_id=run.id, task_type=step.get("type", "unknown"), payload=step.get("payload", {}), status="pending")
        session.add(task)
    
    await session.flush()
    await publish_event("WORKFLOW_STARTED", tenant_id, run.id, {"workflow_id": str(wf.id)})

    return run


async def get_run(session: AsyncSession, tenant_id: uuid.UUID, run_id: uuid.UUID) -> WorkflowRun | None:
    result = await session.execute(select(WorkflowRun).where(and_(WorkflowRun.id == run_id, WorkflowRun.tenant_id == tenant_id, WorkflowRun.deleted_at.is_(None))))
    return result.scalar_one_or_none()


async def list_tasks(session: AsyncSession, tenant_id: uuid.UUID) -> List[Task]:
    result = await session.execute(select(Task).where(and_(Task.tenant_id == tenant_id, Task.deleted_at.is_(None))).order_by(Task.created_at.desc()).limit(100))
    return list(result.scalars().all())
