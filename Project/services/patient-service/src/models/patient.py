"""
MedTrustX Patient Service — Domain Entities

Tables:
  patients              – Core patient identity & demographics
  patient_identifiers   – MRN, UHID, Aadhaar, etc.
  patient_contacts      – Emergency contacts / next-of-kin
"""
import uuid
from datetime import date, datetime, timezone
from typing import List, Optional

from sqlalchemy import (
    Column,
    Date,
    ForeignKey,
    Index,
    String,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class Patient(BaseModel):
    """
    Core patient identity record.

    Scoped to a single tenant (hospital). The (tenant_id, mrn)
    composite uniqueness prevents duplicate registrations within
    the same organization.
    """

    __tablename__ = "patients"
    __table_args__ = (
        UniqueConstraint("tenant_id", "mrn", name="uq_tenant_mrn"),
        Index("ix_patient_search", "tenant_id", "last_name", "dob"),
        Index("ix_patient_mpi", "mpi_id"),
        {"comment": "Core patient identity & demographics"},
    )

    # ── Identity ────────────────────────────────────────────────
    mrn: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Medical Record Number — unique within tenant",
    )
    mpi_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Master Patient Index ID for cross-org linking",
    )

    # ── Demographics ────────────────────────────────────────────
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    dob: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    blood_group: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)

    # ── Contact ─────────────────────────────────────────────────
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address_line1: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address_line2: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, default="IN"
    )

    # ── Status ──────────────────────────────────────────────────
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | inactive | deceased | merged",
    )

    # ── Relationships ───────────────────────────────────────────
    identifiers: Mapped[List["PatientIdentifier"]] = relationship(
        "PatientIdentifier",
        back_populates="patient",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    contacts: Mapped[List["PatientContact"]] = relationship(
        "PatientContact",
        back_populates="patient",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Patient {self.mrn} tenant={self.tenant_id}>"


class PatientIdentifier(BaseModel):
    """
    Secondary identifiers — MRN aliases, UHID, Aadhaar hash,
    insurance IDs, passport numbers, etc.

    type + value is unique within a tenant to prevent duplicate
    identifier assignment.
    """

    __tablename__ = "patient_identifiers"
    __table_args__ = (
        UniqueConstraint("tenant_id", "type", "value", name="uq_tenant_id_type_value"),
        Index("ix_identifier_patient", "patient_id"),
        {"comment": "Secondary patient identifiers (MRN, UHID, Aadhaar, etc.)"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
    )
    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Identifier type: MRN, UHID, AADHAAR, PASSPORT, INSURANCE, etc.",
    )
    value: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Identifier value",
    )

    # ── Relationship ────────────────────────────────────────────
    patient: Mapped["Patient"] = relationship(
        "Patient", back_populates="identifiers"
    )

    def __repr__(self) -> str:
        return f"<PatientIdentifier {self.type}={self.value}>"


class PatientContact(BaseModel):
    """
    Emergency contacts and next-of-kin for a patient.
    """

    __tablename__ = "patient_contacts"
    __table_args__ = (
        Index("ix_contact_patient", "patient_id"),
        {"comment": "Patient emergency contacts and next-of-kin"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    relationship_type: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Relationship: spouse, parent, sibling, guardian, etc.",
    )
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_primary: Mapped[bool] = mapped_column(
        default=False,
        comment="Primary emergency contact flag",
    )

    # ── Relationship ────────────────────────────────────────────
    patient: Mapped["Patient"] = relationship(
        "Patient", back_populates="contacts"
    )

    def __repr__(self) -> str:
        return f"<PatientContact {self.name} ({self.relationship_type})>"
