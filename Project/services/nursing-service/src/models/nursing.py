"""
MedTrustX Nursing Service — Domain Entities

Tables:
  nursing_tasks   – Assigned actions for a nurse (meds, vitals, procedures)
  nursing_notes   – Unstructured/semi-structured bedside notes
  vitals          – High-frequency bedside measurements
  shift_handovers – Logs passing context between nursing shifts
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    DateTime,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class NursingTask(BaseModel):
    """
    Actionable task assigned to nursing staff.
    """

    __tablename__ = "nursing_tasks"
    __table_args__ = (
        Index("ix_task_patient", "tenant_id", "patient_id"),
        Index("ix_task_assignee_status", "tenant_id", "assigned_to", "status"),
        {"comment": "Nursing task assignments"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Reference to patient-service.patients.id",
    )
    
    encounter_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Reference to clinical-service.encounters.id",
    )

    task_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="vitals | medication | procedure | hygiene",
    )
    
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    
    assigned_to: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Reference to iam-service.users.id (Nurse)",
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        server_default=text("'pending'"),
        comment="pending | in_progress | completed | missed",
    )
    
    due_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    completed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )


class NursingNote(BaseModel):
    """
    General bedside observation or shift update.
    """

    __tablename__ = "nursing_notes"
    __table_args__ = (
        Index("ix_nursing_note_patient", "tenant_id", "patient_id"),
        {"comment": "Operational nursing notes"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    encounter_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )
    
    note: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )


class Vitals(BaseModel):
    """
    High-frequency observations recorded by nursing staff.
    """

    __tablename__ = "vitals"
    __table_args__ = (
        Index("ix_vitals_patient", "tenant_id", "patient_id"),
        {"comment": "Bedside vitals measurements"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    encounter_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )
    
    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="E.g., BP, HR, Temp, SpO2",
    )
    
    value: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    
    unit: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )
    
    recorded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )


class ShiftHandover(BaseModel):
    """
    Logs generated at the end of a nursing shift.
    """

    __tablename__ = "shift_handovers"
    __table_args__ = (
        Index("ix_handover_nurse", "tenant_id", "nurse_id"),
        {"comment": "Shift handover logs"},
    )

    nurse_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Nurse who is finishing the shift",
    )
    
    shift_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    
    shift_end: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    
    notes: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Summary of actions and pending items for next shift",
    )
