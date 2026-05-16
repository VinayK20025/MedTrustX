"""
MedTrustX Clinical Service — Domain Entities

Tables:
  encounters      – Core tracking mechanism for patient visits/admissions
  clinical_notes  – Subjective, Objective, Assessment, Plan (SOAP) records
  diagnoses       – ICD-10 coded problems/conditions
  observations    – Vitals, symptoms, basic measurements
"""
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class Encounter(BaseModel):
    """
    Tracks a specific interaction or admission for a patient.
    All clinical documentation is tied to an encounter.
    """

    __tablename__ = "encounters"
    __table_args__ = (
        Index("ix_encounter_patient", "tenant_id", "patient_id"),
        Index("ix_encounter_status", "tenant_id", "status"),
        {"comment": "Patient encounters (OPD visit, IPD admission, etc.)"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Reference to patient-service.patients.id",
    )
    
    encounter_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="OPD | IPD | ER | TELEMED",
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | closed | cancelled",
    )
    
    attending_physician: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Reference to iam-service.users.id",
    )
    
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    
    ended_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    notes: Mapped[List["ClinicalNote"]] = relationship(
        "ClinicalNote",
        back_populates="encounter",
        cascade="all, delete-orphan",
    )
    diagnoses: Mapped[List["Diagnosis"]] = relationship(
        "Diagnosis",
        back_populates="encounter",
        cascade="all, delete-orphan",
    )
    observations: Mapped[List["Observation"]] = relationship(
        "Observation",
        back_populates="encounter",
        cascade="all, delete-orphan",
    )


class ClinicalNote(BaseModel):
    """
    SOAP structured clinical documentation.
    """

    __tablename__ = "clinical_notes"
    __table_args__ = (
        Index("ix_note_encounter", "tenant_id", "encounter_id"),
        {"comment": "Structured SOAP notes"},
    )

    encounter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("encounters.id", ondelete="CASCADE"),
        nullable=False,
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Denormalized for faster patient history querying",
    )
    
    subjective: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    objective: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    assessment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    plan: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Reference to iam-service.users.id",
    )

    # ── Relationship ────────────────────────────────────────────
    encounter: Mapped["Encounter"] = relationship(
        "Encounter", back_populates="notes"
    )


class Diagnosis(BaseModel):
    """
    Standardized diagnoses (typically ICD-10 coded).
    """

    __tablename__ = "diagnoses"
    __table_args__ = (
        Index("ix_diagnosis_encounter", "tenant_id", "encounter_id"),
        Index("ix_diagnosis_icd", "tenant_id", "icd_code"),
        {"comment": "Patient diagnoses and problems"},
    )

    encounter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("encounters.id", ondelete="CASCADE"),
        nullable=False,
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Denormalized for faster patient history querying",
    )
    
    icd_code: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Standardized terminology code (e.g., ICD-10)",
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Human readable diagnosis description",
    )
    type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="primary",
        comment="primary | secondary | provisional | differential",
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        comment="active | resolved | chronic",
    )
    
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    # ── Relationship ────────────────────────────────────────────
    encounter: Mapped["Encounter"] = relationship(
        "Encounter", back_populates="diagnoses"
    )


class Observation(BaseModel):
    """
    Vitals and simple observations.
    """

    __tablename__ = "observations"
    __table_args__ = (
        Index("ix_observation_encounter", "tenant_id", "encounter_id"),
        {"comment": "Vital signs and clinical observations"},
    )

    encounter_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("encounters.id", ondelete="CASCADE"),
        nullable=False,
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Denormalized for faster patient history querying",
    )
    
    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="E.g., BLOOD_PRESSURE, HEART_RATE, TEMPERATURE",
    )
    value: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    unit: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    # ── Relationship ────────────────────────────────────────────
    encounter: Mapped["Encounter"] = relationship(
        "Encounter", back_populates="observations"
    )
