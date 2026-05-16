"""
MedTrustX Case Management Service — Domain Entities

Five tables orchestrating cases, care plans, tasks, notes, and outcomes.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Case(BaseModel):
    """The root longitudinal patient case (e.g. chronic care, transplant)."""
    __tablename__ = "cases"
    __table_args__ = (
        Index("ix_cm_case_pat", "tenant_id", "patient_id"),
        Index("ix_cm_case_status", "tenant_id", "status"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    case_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")  # open, closed, escalated


class CarePlan(BaseModel):
    """The prescribed plan and trajectory associated with a Case."""
    __tablename__ = "care_plans"
    __table_args__ = (
        Index("ix_cm_plan_case", "tenant_id", "case_id"),
    )

    case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    plan_details: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class CaseTask(BaseModel):
    """A specific action item required as part of the Care Plan."""
    __tablename__ = "case_tasks"
    __table_args__ = (
        Index("ix_cm_task_case", "tenant_id", "case_id"),
        Index("ix_cm_task_assign", "tenant_id", "assigned_to"),
    )

    case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    task_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, in_progress, completed
    assigned_to: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class CaseNote(BaseModel):
    """A chronological narrative entry by a care coordinator or manager."""
    __tablename__ = "case_notes"
    __table_args__ = (
        Index("ix_cm_note_case", "tenant_id", "case_id"),
    )

    case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    note: Mapped[str] = mapped_column(Text, nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)


class CaseOutcome(BaseModel):
    """Recorded result or measurement indicating the success of the Case."""
    __tablename__ = "case_outcomes"
    __table_args__ = (
        Index("ix_cm_out_case", "tenant_id", "case_id"),
    )

    case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    outcome_type: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
