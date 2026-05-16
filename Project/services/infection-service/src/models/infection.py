"""
MedTrustX Infection Control Service — Domain Entities

Tables:
  infections               – Patient infection cases
  infection_events         – Audit log of infection state changes
  isolation_cases          – Tracking of patient isolation protocols
  infection_audits         – Hygiene and protocol compliance audits
  antimicrobial_resistance – AMR tracking per patient/organism
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
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class Infection(BaseModel):
    """
    Tracks a specific instance of an infection in a patient.
    """

    __tablename__ = "infections"
    __table_args__ = (
        Index("ix_infections_patient", "tenant_id", "patient_id"),
        Index("ix_infections_type_status", "tenant_id", "infection_type", "status"),
        {"comment": "Patient infection cases"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    encounter_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Optional linkage to the specific admission/encounter",
    )

    infection_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="E.g., MRSA, C. diff, COVID-19, VAP",
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | resolved | unverified",
    )

    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    events: Mapped[List["InfectionEvent"]] = relationship(
        "InfectionEvent", back_populates="infection", cascade="all, delete-orphan"
    )


class InfectionEvent(BaseModel):
    """
    Log of events related to an infection case (e.g., lab confirmed, symptoms escalated).
    """

    __tablename__ = "infection_events"
    __table_args__ = (
        Index("ix_infection_events_infection", "tenant_id", "infection_id"),
        {"comment": "Audit trail for infection state changes"},
    )

    infection_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("infections.id", ondelete="CASCADE"),
        nullable=False,
    )

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="lab_confirmed | status_change | clinical_note",
    )
    
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    # ── Relationships ───────────────────────────────────────────
    infection: Mapped["Infection"] = relationship(
        "Infection", back_populates="events"
    )


class IsolationCase(BaseModel):
    """
    Tracks application of isolation protocols to a patient.
    """

    __tablename__ = "isolation_cases"
    __table_args__ = (
        Index("ix_isolation_patient", "tenant_id", "patient_id"),
        {"comment": "Patient isolation protocols tracking"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    isolation_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="contact | droplet | airborne | strict",
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | ended",
    )

    start_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    
    end_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )


class InfectionAudit(BaseModel):
    """
    Compliance and hygiene protocol audits conducted in departments.
    """

    __tablename__ = "infection_audits"
    __table_args__ = (
        Index("ix_audits_department", "tenant_id", "department"),
        {"comment": "Hygiene and protocol compliance audits"},
    )

    audit_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="hand_hygiene | sterilization | environmental_cleaning",
    )
    
    department: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    
    score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Audit score 0-100",
    )
    
    conducted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    
    conducted_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )


class AntimicrobialResistance(BaseModel):
    """
    Epidemiological tracking of resistant organisms.
    """

    __tablename__ = "antimicrobial_resistance"
    __table_args__ = (
        Index("ix_amr_patient", "tenant_id", "patient_id"),
        Index("ix_amr_organism", "tenant_id", "organism", "drug"),
        {"comment": "AMR tracking per patient/organism"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    organism: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="E.g., Staphylococcus aureus, Klebsiella pneumoniae",
    )
    
    drug: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="E.g., Methicillin, Meropenem",
    )
    
    resistance_level: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="susceptible | intermediate | resistant",
    )

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
