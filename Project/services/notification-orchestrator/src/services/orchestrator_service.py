"""
MedTrustX Notification Orchestrator Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.orchestrator import (
    NotificationWorkflow, WorkflowInstance, WorkflowStep, EscalationRule, WorkflowEvent
)
from src.schemas.orchestrator import (
    WorkflowCreate, WorkflowUpdate, EscalationRuleCreate, InstanceCreate, WorkflowEventCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Workflows ──

async def create_workflow(
    session: AsyncSession, tenant_id: uuid.UUID, data: WorkflowCreate
) -> NotificationWorkflow:
    workflow = NotificationWorkflow(
        tenant_id=tenant_id,
        name=data.name,
        definition=data.definition,
        active=data.active,
    )
    session.add(workflow)
    await session.flush()
    return workflow

async def get_workflow(
    session: AsyncSession, tenant_id: uuid.UUID, workflow_id: uuid.UUID
) -> Optional[NotificationWorkflow]:
    result = await session.execute(
        select(NotificationWorkflow).where(and_(NotificationWorkflow.id == workflow_id, NotificationWorkflow.tenant_id == tenant_id, NotificationWorkflow.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_workflow(
    session: AsyncSession, tenant_id: uuid.UUID, workflow_id: uuid.UUID, data: WorkflowUpdate
) -> Optional[NotificationWorkflow]:
    workflow = await get_workflow(session, tenant_id, workflow_id)
    if not workflow:
        return None
    
    if data.name:
        workflow.name = data.name
    if data.definition is not None:
        workflow.definition = data.definition
    if data.active is not None:
        workflow.active = data.active
        
    workflow.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return workflow

# ── Workflow Instances ──

async def create_instance(
    session: AsyncSession, tenant_id: uuid.UUID, data: InstanceCreate
) -> WorkflowInstance:
    instance = WorkflowInstance(
        tenant_id=tenant_id,
        workflow_id=data.workflow_id,
        reference_id=data.reference_id,
        status="running",
    )
    session.add(instance)
    await session.flush()

    event = WorkflowEvent(
        tenant_id=tenant_id,
        instance_id=instance.id,
        event_type="WORKFLOW_STARTED",
        payload={"reference_id": str(data.reference_id)}
    )
    session.add(event)
    await session.flush()

    await publish_event("WORKFLOW_STARTED", tenant_id, instance.id, {
        "instance_id": str(instance.id),
        "workflow_id": str(instance.workflow_id),
    })
    return instance

async def get_instance(
    session: AsyncSession, tenant_id: uuid.UUID, instance_id: uuid.UUID
) -> Optional[WorkflowInstance]:
    result = await session.execute(
        select(WorkflowInstance)
        .options(
            selectinload(WorkflowInstance.steps),
            selectinload(WorkflowInstance.events)
        )
        .where(and_(WorkflowInstance.id == instance_id, WorkflowInstance.tenant_id == tenant_id, WorkflowInstance.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def get_instance_steps(
    session: AsyncSession, tenant_id: uuid.UUID, instance_id: uuid.UUID
) -> List[WorkflowStep]:
    result = await session.execute(
        select(WorkflowStep).where(and_(WorkflowStep.tenant_id == tenant_id, WorkflowStep.instance_id == instance_id, WorkflowStep.deleted_at.is_(None))).order_by(WorkflowStep.executed_at.asc())
    )
    return list(result.scalars().all())

# ── Escalation Rules ──

async def create_escalation_rule(
    session: AsyncSession, tenant_id: uuid.UUID, data: EscalationRuleCreate
) -> EscalationRule:
    rule = EscalationRule(
        tenant_id=tenant_id,
        trigger_event=data.trigger_event,
        escalation_chain=data.escalation_chain,
    )
    session.add(rule)
    await session.flush()
    return rule

async def get_escalation_rule(
    session: AsyncSession, tenant_id: uuid.UUID, rule_id: uuid.UUID
) -> Optional[EscalationRule]:
    result = await session.execute(
        select(EscalationRule).where(and_(EscalationRule.id == rule_id, EscalationRule.tenant_id == tenant_id, EscalationRule.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Workflow Events ──

async def add_workflow_event(
    session: AsyncSession, tenant_id: uuid.UUID, data: WorkflowEventCreate
) -> WorkflowEvent:
    event = WorkflowEvent(
        tenant_id=tenant_id,
        instance_id=data.instance_id,
        event_type=data.event_type,
        payload=data.payload,
    )
    session.add(event)
    await session.flush()

    if data.event_type in ["ESCALATION_TRIGGERED", "STEP_EXECUTED", "WORKFLOW_COMPLETED"]:
        await publish_event(data.event_type, tenant_id, data.instance_id, data.payload)

    return event
