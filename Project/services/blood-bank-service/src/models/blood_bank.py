"""
MedTrustX Blood Bank Service — Domain Entities

Tables:
  blood_units     – Inventory of physical blood products
  donors          – Individuals who have provided blood
  crossmatches    – Medical compatibility tests between patient and unit
  transfusions    – Bedside execution and lifecycle of a transfusion
"""
import uuid
from datetime import datetime
from typing import Optional, List

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


class Donor(BaseModel):
    """
    Individuals who have donated blood.
    """

    __tablename__ = "donors"
    __table_args__ = (
        Index("ix_donor_blood_group", "tenant_id", "blood_group"),
        {"comment": "Blood donors"},
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    
    blood_group: Mapped[str] = mapped_column(
        String(5),
        nullable=False,
        comment="E.g., A+, O-",
    )
    
    eligibility_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="eligible",
        comment="eligible | deferred | banned",
    )
    
    last_donation_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    donations: Mapped[List["BloodUnit"]] = relationship(
        "BloodUnit",
        back_populates="donor",
        cascade="all, delete-orphan",
    )


class BloodUnit(BaseModel):
    """
    Physical bags of blood components in inventory.
    """

    __tablename__ = "blood_units"
    __table_args__ = (
        Index("ix_inventory_lookup", "tenant_id", "blood_group", "status"),
        Index("ix_unit_expiry", "tenant_id", "expiry_date"),
        {"comment": "Physical blood unit inventory"},
    )

    donor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("donors.id", ondelete="SET NULL"),
        nullable=True,
    )

    blood_group: Mapped[str] = mapped_column(
        String(5),
        nullable=False,
        comment="E.g., A+, O-",
    )
    
    component: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="RBC | Plasma | Platelets",
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="available",
        server_default=text("'available'"),
        comment="available | reserved | used | expired | discarded",
    )
    
    collected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    
    expiry_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    # ── Relationships ───────────────────────────────────────────
    donor: Mapped[Optional["Donor"]] = relationship(
        "Donor", back_populates="donations"
    )
    crossmatches: Mapped[List["Crossmatch"]] = relationship(
        "Crossmatch", back_populates="unit"
    )
    transfusions: Mapped[List["Transfusion"]] = relationship(
        "Transfusion", back_populates="unit"
    )


class Crossmatch(BaseModel):
    """
    Lab test determining if a specific blood unit is safe for a specific patient.
    """

    __tablename__ = "crossmatches"
    __table_args__ = (
        Index("ix_crossmatch_patient", "tenant_id", "patient_id"),
        Index("ix_crossmatch_unit", "tenant_id", "blood_unit_id"),
        {"comment": "Compatibility testing results"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Reference to patient-service.patients.id",
    )
    
    blood_unit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("blood_units.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    compatibility_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="compatible | incompatible | indeterminate",
    )
    
    tested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    
    tested_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Lab tech who performed the test",
    )

    # ── Relationships ───────────────────────────────────────────
    unit: Mapped["BloodUnit"] = relationship(
        "BloodUnit", back_populates="crossmatches"
    )


class Transfusion(BaseModel):
    """
    The actual execution of administering the blood unit to the patient.
    """

    __tablename__ = "transfusions"
    __table_args__ = (
        Index("ix_transfusion_patient", "tenant_id", "patient_id"),
        Index("ix_transfusion_unit", "tenant_id", "blood_unit_id"),
        {"comment": "Transfusion execution logs"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Reference to patient-service.patients.id",
    )
    
    blood_unit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("blood_units.id", ondelete="RESTRICT"),
        nullable=False,
    )
    
    administered_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Nurse or doctor executing the transfusion",
    )
    
    administered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ongoing",
        server_default=text("'ongoing'"),
        comment="ongoing | completed | reaction",
    )
    
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    unit: Mapped["BloodUnit"] = relationship(
        "BloodUnit", back_populates="transfusions"
    )
