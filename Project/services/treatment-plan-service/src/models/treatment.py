"""
MedTrustX Treatment Plan Service — Domain Entities

Tables:
  treatment_plans           – The overarching medical strategy for a patient
  treatment_plan_items      – Specific therapies, medications, or monitoring rules
  treatment_plan_versions   – Audit trail of changes made to a plan over time
  treatment_adherence       – Tracking patient compliance with the plan
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
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


class TreatmentPlan(BaseModel):
    """
    Structured medical strategy.
    E.g., "Hypertension Management Plan" or "Post-Op Recovery Plan"
    """

    __tablename__ = "treatment_plans"
    __table_args__ = (
        Index("ix_t_plans_patient", "tenant_id", "patient_id"),
        Index("ix_t_plans_status", "tenant_id", "status"),
        {"comment": "Patient treatment strategies"},
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
        comment="active | completed | suspended",
    )

    version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default=text("1"),
    )

    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="ID of the clinician who created/authored the plan",
    )

    # ── Relationships ───────────────────────────────────────────
    items: Mapped[List["TreatmentPlanItem"]] = relationship(
        "TreatmentPlanItem", back_populates="treatment_plan", cascade="all, delete-orphan"
    )
    versions: Mapped[List["TreatmentPlanVersion"]] = relationship(
        "TreatmentPlanVersion", back_populates="treatment_plan", cascade="all, delete-orphan"
    )


class TreatmentPlanItem(BaseModel):
    """
    Specific actions defined within a Treatment Plan.
    """

    __tablename__ = "treatment_plan_items"
    __table_args__ = (
        Index("ix_t_items_plan", "tenant_id", "treatment_plan_id"),
        {"comment": "Specific therapies or tasks in a plan"},
    )

    treatment_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("treatment_plans.id", ondelete="CASCADE"),
        nullable=False,
    )

    item_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="medication | procedure | monitoring | lifestyle",
    )
    
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    
    schedule: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        comment="Cron string, frequency, or dynamic scheduling rules",
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | discontinued",
    )

    # ── Relationships ───────────────────────────────────────────
    treatment_plan: Mapped["TreatmentPlan"] = relationship(
        "TreatmentPlan", back_populates="items"
    )


class TreatmentPlanVersion(BaseModel):
    """
    Immutable audit log for clinical plan revisions.
    """

    __tablename__ = "treatment_plan_versions"
    __table_args__ = (
        Index("ix_t_versions_plan", "tenant_id", "treatment_plan_id"),
        {"comment": "Audit trail for plan modifications"},
    )

    treatment_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("treatment_plans.id", ondelete="CASCADE"),
        nullable=False,
    )

    version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    
    changes: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        comment="Diff or full snapshot of the plan state at this version",
    )

    # ── Relationships ───────────────────────────────────────────
    treatment_plan: Mapped["TreatmentPlan"] = relationship(
        "TreatmentPlan", back_populates="versions"
    )


class TreatmentAdherence(BaseModel):
    """
    Tracking whether the patient/staff is following the plan.
    """

    __tablename__ = "treatment_adherence"
    __table_args__ = (
        Index("ix_t_adherence_plan", "tenant_id", "treatment_plan_id"),
        Index("ix_t_adherence_patient", "tenant_id", "patient_id"),
        {"comment": "Tracking compliance with the plan"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    treatment_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("treatment_plans.id", ondelete="CASCADE"),
        nullable=False,
    )

    adherence_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="compliant | non_compliant | partial",
    )
    
    notes: Mapped[str] = mapped_column(
        Text,
        nullable=True,
    )
    
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
