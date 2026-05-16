"""
MedTrustX Pharmacy Service — Domain Entities

Tables:
  prescriptions         – The medication order container
  prescription_items    – Individual drugs prescribed
  dispenses             – Records of drugs issued by pharmacy
  administrations       – Records of drugs given to patient by nurse/clinician
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


class Prescription(BaseModel):
    """
    Groups medications ordered during a specific encounter or visit.
    """

    __tablename__ = "prescriptions"
    __table_args__ = (
        Index("ix_prescription_patient", "tenant_id", "patient_id"),
        Index("ix_prescription_status", "tenant_id", "status"),
        {"comment": "Medication orders"},
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
    
    prescribed_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Reference to iam-service.users.id (Doctor)",
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | completed | cancelled",
    )

    # ── Relationships ───────────────────────────────────────────
    items: Mapped[List["PrescriptionItem"]] = relationship(
        "PrescriptionItem",
        back_populates="prescription",
        cascade="all, delete-orphan",
    )


class PrescriptionItem(BaseModel):
    """
    Specific drug, dosage, and instructions within a prescription.
    """

    __tablename__ = "prescription_items"
    __table_args__ = (
        Index("ix_rxitem_prescription", "tenant_id", "prescription_id"),
        {"comment": "Individual prescribed drugs"},
    )

    prescription_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prescriptions.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    drug_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    
    dosage: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="E.g., 500mg, 10ml",
    )
    
    frequency: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="E.g., BID (twice a day), TID, Q4H",
    )
    
    duration: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="E.g., 5 days, 1 month",
    )
    
    route: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="E.g., oral, IV, topical",
    )
    
    instructions: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Specific directions (e.g., take after meals)",
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        comment="pending | dispensed | completed",
    )

    # ── Relationships ───────────────────────────────────────────
    prescription: Mapped["Prescription"] = relationship(
        "Prescription", back_populates="items"
    )
    dispenses: Mapped[List["Dispense"]] = relationship(
        "Dispense", back_populates="item"
    )
    administrations: Mapped[List["Administration"]] = relationship(
        "Administration", back_populates="item"
    )


class Dispense(BaseModel):
    """
    Record of a drug being physically dispensed from pharmacy inventory.
    """

    __tablename__ = "dispenses"
    __table_args__ = (
        Index("ix_dispense_item", "tenant_id", "prescription_item_id"),
        {"comment": "Medication dispense records"},
    )

    prescription_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prescription_items.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Total units dispensed",
    )
    
    dispensed_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Reference to iam-service.users.id (Pharmacist)",
    )
    
    dispensed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    # ── Relationship ────────────────────────────────────────────
    item: Mapped["PrescriptionItem"] = relationship(
        "PrescriptionItem", back_populates="dispenses"
    )


class Administration(BaseModel):
    """
    Record of a drug being administered to the patient (IPD focus).
    """

    __tablename__ = "administrations"
    __table_args__ = (
        Index("ix_admin_item", "tenant_id", "prescription_item_id"),
        Index("ix_admin_patient", "tenant_id", "patient_id"),
        {"comment": "Medication administration records"},
    )

    prescription_item_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("prescription_items.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Denormalized for quick patient med history",
    )
    
    administered_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Reference to iam-service.users.id (Nurse/Doctor)",
    )
    
    administered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="given",
        comment="given | missed | delayed",
    )
    
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # ── Relationship ────────────────────────────────────────────
    item: Mapped["PrescriptionItem"] = relationship(
        "PrescriptionItem", back_populates="administrations"
    )
