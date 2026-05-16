"""
MedTrustX Emergency (ER) Service — Domain Entities

Tables:
  emergency_cases    – Core ER case lifecycle (arrival → discharge/admission)
  triage_records     – Clinical triage assessments with vitals & priority scoring
  er_assignments     – Staff (doctor/nurse) assignment to emergency cases
  er_events          – Immutable event log for case timeline & audit trail
  er_queue           – Real-time priority queue for active ER cases

Indexing Strategy:
  (tenant_id, severity_level) — fast severity-based lookups per hospital
  (priority, status)          — queue ordering and filtering
  (arrival_time)              — chronological case retrieval
"""
import uuid
from datetime import datetime, timezone
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


class EmergencyCase(BaseModel):
    """
    Core ER case entity — represents a single emergency patient encounter.

    Lifecycle: registered → triaged → in_treatment → discharged | admitted | transferred
    Severity: critical | high | medium | low | non_urgent (ESI 1–5 mapping)
    """

    __tablename__ = "emergency_cases"
    __table_args__ = (
        Index("ix_er_cases_severity", "tenant_id", "severity_level"),
        Index("ix_er_cases_status", "tenant_id", "status"),
        Index("ix_er_cases_arrival", "arrival_time"),
        Index("ix_er_cases_patient", "tenant_id", "patient_id"),
        Index("ix_er_cases_doctor", "tenant_id", "assigned_doctor"),
        {"comment": "Emergency case lifecycle management"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="FK → patient-service (cross-service reference)",
    )

    arrival_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"),
        comment="Exact patient arrival timestamp",
    )

    severity_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="medium",
        server_default=text("'medium'"),
        comment="critical | high | medium | low | non_urgent",
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="registered",
        server_default=text("'registered'"),
        comment="registered | triaged | in_treatment | discharged | admitted | transferred | deceased",
    )

    assigned_doctor: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Primary attending physician (FK → IAM user)",
    )

    chief_complaint: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Brief initial complaint at registration",
    )

    mode_of_arrival: Mapped[Optional[str]] = mapped_column(
        String(30),
        nullable=True,
        default="walk_in",
        comment="ambulance | walk_in | referred | police | helicopter",
    )

    er_unit: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Multi-ER unit identifier (e.g., ER-A, Trauma Bay)",
    )

    discharge_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="When patient left ER (discharge/admission/transfer)",
    )

    disposition: Mapped[Optional[str]] = mapped_column(
        String(30),
        nullable=True,
        comment="discharged_home | admitted_ward | admitted_icu | transferred | lama | deceased",
    )

    # ── Relationships ───────────────────────────────────────────
    triage_records: Mapped[List["TriageRecord"]] = relationship(
        "TriageRecord", back_populates="emergency_case", cascade="all, delete-orphan",
        order_by="TriageRecord.triaged_at.desc()",
    )
    assignments: Mapped[List["ERAssignment"]] = relationship(
        "ERAssignment", back_populates="emergency_case", cascade="all, delete-orphan",
    )
    events: Mapped[List["EREvent"]] = relationship(
        "EREvent", back_populates="emergency_case", cascade="all, delete-orphan",
        order_by="EREvent.created_at.desc()",
    )
    queue_entry: Mapped[Optional["ERQueue"]] = relationship(
        "ERQueue", back_populates="emergency_case", uselist=False, cascade="all, delete-orphan",
    )


class TriageRecord(BaseModel):
    """
    Clinical triage assessment — captures vitals, symptoms, and computed
    priority score (ESI-based or custom algorithm).

    A case may be re-triaged if the patient's condition changes, so multiple
    triage records per case are supported.
    """

    __tablename__ = "triage_records"
    __table_args__ = (
        Index("ix_triage_case", "tenant_id", "case_id"),
        Index("ix_triage_priority", "priority_score"),
        {"comment": "ER triage assessments with priority scoring"},
    )

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("emergency_cases.id", ondelete="CASCADE"),
        nullable=False,
    )

    symptoms: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Free-text symptom description from triage nurse",
    )

    vitals: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Structured vitals: {hr, bp_systolic, bp_diastolic, temp, spo2, rr, gcs}",
    )

    priority_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=3,
        comment="1 (highest/resuscitation) → 5 (lowest/non-urgent), ESI mapping",
    )

    triage_category: Mapped[Optional[str]] = mapped_column(
        String(30),
        nullable=True,
        comment="resuscitation | emergent | urgent | less_urgent | non_urgent",
    )

    triaged_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Staff member who performed triage (FK → IAM user)",
    )

    triaged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"),
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Additional clinical observations during triage",
    )

    # ── Relationships ───────────────────────────────────────────
    emergency_case: Mapped["EmergencyCase"] = relationship(
        "EmergencyCase", back_populates="triage_records",
    )


class ERAssignment(BaseModel):
    """
    Staff assignment to an emergency case — tracks which doctors,
    nurses, and specialists are allocated to each case.
    """

    __tablename__ = "er_assignments"
    __table_args__ = (
        Index("ix_er_assign_case", "tenant_id", "case_id"),
        Index("ix_er_assign_staff", "tenant_id", "staff_id"),
        {"comment": "Staff assignments to ER cases"},
    )

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("emergency_cases.id", ondelete="CASCADE"),
        nullable=False,
    )

    staff_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="FK → IAM service user ID",
    )

    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="attending_doctor | resident | er_nurse | specialist | paramedic",
    )

    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"),
    )

    unassigned_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="When staff was relieved from this case",
    )

    is_active: Mapped[bool] = mapped_column(
        nullable=False,
        default=True,
        server_default=text("true"),
        comment="Whether assignment is currently active",
    )

    # ── Relationships ───────────────────────────────────────────
    emergency_case: Mapped["EmergencyCase"] = relationship(
        "EmergencyCase", back_populates="assignments",
    )


class EREvent(BaseModel):
    """
    Immutable event log for emergency case timeline — provides a
    complete audit trail of every action taken on a case.

    Event types: CASE_REGISTERED, TRIAGE_COMPLETED, DOCTOR_ASSIGNED,
    TREATMENT_STARTED, VITALS_UPDATED, ESCALATED, TRANSFERRED,
    DISCHARGED, ADMITTED, NOTE_ADDED, STATUS_CHANGED
    """

    __tablename__ = "er_events"
    __table_args__ = (
        Index("ix_er_events_case", "tenant_id", "case_id"),
        Index("ix_er_events_type", "tenant_id", "event_type"),
        Index("ix_er_events_created", "created_at"),
        {"comment": "Immutable ER case event log / audit trail"},
    )

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("emergency_cases.id", ondelete="CASCADE"),
        nullable=False,
    )

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Standardized event type (e.g., TRIAGE_COMPLETED)",
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Human-readable event description",
    )

    metadata: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Structured event payload for downstream consumers",
    )

    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="User who triggered this event (FK → IAM)",
    )

    # ── Relationships ───────────────────────────────────────────
    emergency_case: Mapped["EmergencyCase"] = relationship(
        "EmergencyCase", back_populates="events",
    )


class ERQueue(BaseModel):
    """
    Real-time priority queue for active ER cases — provides the
    prioritized view of cases awaiting treatment.

    Priority: 1 = highest (resuscitation), 5 = lowest (non-urgent).
    This table acts as a materialized queue that can be
    recalculated when triage changes.
    """

    __tablename__ = "er_queue"
    __table_args__ = (
        Index("ix_er_queue_priority", "priority", "status"),
        Index("ix_er_queue_tenant", "tenant_id", "status"),
        {"comment": "Real-time ER priority queue"},
    )

    case_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("emergency_cases.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        comment="One queue entry per active case",
    )

    priority: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=3,
        comment="1 (highest) → 5 (lowest), derived from triage",
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="waiting",
        server_default=text("'waiting'"),
        comment="waiting | in_treatment | completed",
    )

    wait_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"),
        comment="When patient entered the queue",
    )

    # ── Relationships ───────────────────────────────────────────
    emergency_case: Mapped["EmergencyCase"] = relationship(
        "EmergencyCase", back_populates="queue_entry",
    )
