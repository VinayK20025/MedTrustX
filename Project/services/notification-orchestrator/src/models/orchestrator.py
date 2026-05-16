"""
MedTrustX Notification Orchestrator Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel

class NotificationWorkflow(BaseModel):
    __tablename__ = "notification_workflows"
    __table_args__ = (
        Index("ix_workflows_tenant_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    definition: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))

    instances: Mapped[List["WorkflowInstance"]] = relationship("WorkflowInstance", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowInstance(BaseModel):
    __tablename__ = "workflow_instances"
    __table_args__ = (
        Index("ix_instances_tenant_workflow", "tenant_id", "workflow_id"),
        Index("ix_instances_reference", "reference_id"),
        Index("ix_instances_status", "status"),
    )

    workflow_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notification_workflows.id", ondelete="CASCADE"), nullable=False)
    reference_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="running", server_default=text("'running'"))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    workflow: Mapped["NotificationWorkflow"] = relationship("NotificationWorkflow", back_populates="instances")
    steps: Mapped[List["WorkflowStep"]] = relationship("WorkflowStep", back_populates="instance", cascade="all, delete-orphan", order_by="WorkflowStep.executed_at.asc()")
    events: Mapped[List["WorkflowEvent"]] = relationship("WorkflowEvent", back_populates="instance", cascade="all, delete-orphan", order_by="WorkflowEvent.created_at.asc()")


class WorkflowStep(BaseModel):
    __tablename__ = "workflow_steps"

    instance_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workflow_instances.id", ondelete="CASCADE"), nullable=False)
    step_type: Mapped[str] = mapped_column(String(50), nullable=False)
    channel: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default=text("'pending'"))
    executed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    instance: Mapped["WorkflowInstance"] = relationship("WorkflowInstance", back_populates="steps")


class EscalationRule(BaseModel):
    __tablename__ = "escalation_rules"
    __table_args__ = (
        Index("ix_escalation_tenant_trigger", "tenant_id", "trigger_event"),
    )

    trigger_event: Mapped[str] = mapped_column(String(100), nullable=False)
    escalation_chain: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)


class WorkflowEvent(BaseModel):
    __tablename__ = "workflow_events"

    instance_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workflow_instances.id", ondelete="CASCADE"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    instance: Mapped["WorkflowInstance"] = relationship("WorkflowInstance", back_populates="events")
