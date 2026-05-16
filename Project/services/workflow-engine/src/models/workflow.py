"""
MedTrustX Workflow Engine — Domain Entities

Five tables orchestrating stateful processes: workflows, definitions,
instances, tasks, and state transitions.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Workflow(BaseModel):
    """A registered workflow type (e.g. Patient Admission)."""
    __tablename__ = "workflows"
    __table_args__ = (
        Index("ix_we_wf_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active, deprecated


class WorkflowDefinition(BaseModel):
    """JSON representation of the state machine/DAG for a Workflow."""
    __tablename__ = "workflow_definitions"
    __table_args__ = (
        Index("ix_we_def_wf", "tenant_id", "workflow_id"),
    )

    workflow_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    definition: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)


class WorkflowInstance(BaseModel):
    """An active execution of a workflow."""
    __tablename__ = "workflow_instances"
    __table_args__ = (
        Index("ix_we_inst_wf", "tenant_id", "workflow_id"),
        Index("ix_we_inst_state", "tenant_id", "state"),
    )

    workflow_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    state: Mapped[str] = mapped_column(String(50), nullable=False, default="started")
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Task(BaseModel):
    """A human or system task generated as part of a workflow instance."""
    __tablename__ = "tasks"
    __table_args__ = (
        Index("ix_we_task_inst", "tenant_id", "instance_id"),
    )

    instance_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    task_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, completed, failed
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True)


class Transition(BaseModel):
    """Audit record of a state transition in a workflow instance."""
    __tablename__ = "transitions"
    __table_args__ = (
        Index("ix_we_trans_inst", "tenant_id", "instance_id"),
    )

    instance_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    from_state: Mapped[str] = mapped_column(String(50), nullable=False)
    to_state: Mapped[str] = mapped_column(String(50), nullable=False)
    triggered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
