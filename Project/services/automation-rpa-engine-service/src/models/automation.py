"""
MedTrustX Automation & RPA Engine Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class Workflow(BaseModel):
    """Definition of an automated workflow or RPA sequence."""
    __tablename__ = "workflows"
    __table_args__ = (
        Index("ix_workflow_tenant_status", "tenant_id", "status"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    definition: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

class WorkflowRun(BaseModel):
    """An execution instance of a defined workflow."""
    __tablename__ = "workflow_runs"
    __table_args__ = (
        Index("ix_run_tenant_workflow", "tenant_id", "workflow_id"),
        Index("ix_run_status", "status"),
    )
    workflow_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending") # pending, running, completed, failed
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class Task(BaseModel):
    """An individual step or RPA action within a workflow run."""
    __tablename__ = "tasks"
    __table_args__ = (
        Index("ix_task_tenant_run", "tenant_id", "workflow_id"),
        Index("ix_task_type", "task_type"),
    )
    workflow_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False) # Represents the run ID
    task_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")

class Bot(BaseModel):
    """Registered RPA bots or workers capable of executing tasks."""
    __tablename__ = "bots"
    __table_args__ = (
        Index("ix_bot_tenant_type", "tenant_id", "type"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g., browser, api, ui_automation
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="idle") # idle, busy, offline
