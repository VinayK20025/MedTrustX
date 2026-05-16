"""
MedTrustX Care Coordination Service — Domain Entities

Tables:
  care_plans      – Overarching journey/milestone tracker for a patient
  care_tasks      – Specific, assignable actions within a care plan
  care_workflows  – Reusable protocol templates (JSONB BPMN/logic)
  care_events     – Audit trail of orchestration progression
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class CarePlan(BaseModel):
    """
    Overarching patient journey tracker.
    E.g., "Knee Replacement Pathway" or "Sepsis 3-Hour Bundle"
    """

    __tablename__ = "care_plans"
    __table_args__ = (
        Index("ix_care_plans_patient", "tenant_id", "patient_id"),
        Index("ix_care_plans_status", "tenant_id", "status"),
        {"comment": "Patient care journey orchestration"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    encounter_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )

    plan_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | completed | suspended | aborted",
    )

    # ── Relationships ───────────────────────────────────────────
    tasks: Mapped[List["CareTask"]] = relationship(
        "CareTask", back_populates="care_plan", cascade="all, delete-orphan"
    )
    events: Mapped[List["CareEvent"]] = relationship(
        "CareEvent", back_populates="care_plan", cascade="all, delete-orphan"
    )


class CareTask(BaseModel):
    """
    Actionable unit within a Care Plan, assigned to a role or specific user.
    """

    __tablename__ = "care_tasks"
    __table_args__ = (
        Index("ix_care_tasks_plan", "tenant_id", "care_plan_id"),
        Index("ix_care_tasks_due", "tenant_id", "due_time"),
        {"comment": "Orchestrated actions across departments"},
    )

    care_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("care_plans.id", ondelete="CASCADE"),
        nullable=False,
    )

    task_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    
    assigned_to: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Specific user ID (doctor/nurse) or role ID from IAM",
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        server_default=text("'pending'"),
        comment="pending | in_progress | completed | skipped",
    )

    due_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    care_plan: Mapped["CarePlan"] = relationship(
        "CarePlan", back_populates="tasks"
    )


class CareWorkflow(BaseModel):
    """
    Reusable templates defining standardized care pathways.
    """

    __tablename__ = "care_workflows"
    __table_args__ = (
        Index("ix_care_workflows_name", "tenant_id", "workflow_name"),
        {"comment": "Standardized pathway definitions"},
    )

    workflow_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    
    definition: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        comment="JSON representation of steps, dependencies, and conditionals",
    )
    
    version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )
    
    active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=text("true"),
    )


class CareEvent(BaseModel):
    """
    Immutable audit log tracking the orchestration lifecycle.
    """

    __tablename__ = "care_events"
    __table_args__ = (
        Index("ix_care_events_plan", "tenant_id", "care_plan_id"),
        {"comment": "Audit trail for workflow progression"},
    )

    care_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("care_plans.id", ondelete="CASCADE"),
        nullable=False,
    )

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="plan_created | task_assigned | task_completed | plan_completed",
    )
    
    description: Mapped[str] = mapped_column(
        Text,
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    care_plan: Mapped["CarePlan"] = relationship(
        "CarePlan", back_populates="events"
    )
