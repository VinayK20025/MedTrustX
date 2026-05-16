"""
MedTrustX Diagnostics Service — Domain Entities

Tables:
  diagnostic_orders  – Lab/imaging requests
  samples            – Lab sample tracking
  results            – Discrete lab results
  imaging_results    – Radiology reports and imaging links
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


class DiagnosticOrder(BaseModel):
    """
    Tracks a request for a diagnostic test (lab or imaging).
    Acts as the root aggregate for samples and results.
    """

    __tablename__ = "diagnostic_orders"
    __table_args__ = (
        Index("ix_order_patient", "tenant_id", "patient_id"),
        Index("ix_order_status", "tenant_id", "status"),
        {"comment": "Diagnostic test orders"},
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
    
    order_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="lab | imaging | pathology",
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ordered",
        server_default=text("'ordered'"),
        comment="ordered | collected | processing | completed | cancelled",
    )
    
    test_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Name of the requested test/panel",
    )
    
    ordered_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Reference to iam-service.users.id",
    )
    
    priority: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="routine",
        comment="routine | urgent | stat",
    )

    # ── Relationships ───────────────────────────────────────────
    samples: Mapped[List["Sample"]] = relationship(
        "Sample",
        back_populates="order",
        cascade="all, delete-orphan",
    )
    results: Mapped[List["Result"]] = relationship(
        "Result",
        back_populates="order",
        cascade="all, delete-orphan",
    )
    imaging_results: Mapped[List["ImagingResult"]] = relationship(
        "ImagingResult",
        back_populates="order",
        cascade="all, delete-orphan",
    )


class Sample(BaseModel):
    """
    Physical specimen tracking for lab orders.
    """

    __tablename__ = "samples"
    __table_args__ = (
        Index("ix_sample_order", "tenant_id", "order_id"),
        {"comment": "Lab sample tracking"},
    )

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("diagnostic_orders.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    sample_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="blood | urine | tissue | swab",
    )
    
    barcode: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Physical barcode on sample tube",
    )
    
    collected_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    collected_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        comment="pending | collected | received | rejected",
    )

    rejection_reason: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    # ── Relationship ────────────────────────────────────────────
    order: Mapped["DiagnosticOrder"] = relationship(
        "DiagnosticOrder", back_populates="samples"
    )


class Result(BaseModel):
    """
    Discrete quantitative or qualitative lab result.
    """

    __tablename__ = "results"
    __table_args__ = (
        Index("ix_result_order", "tenant_id", "order_id"),
        Index("ix_result_patient", "tenant_id", "patient_id"),
        {"comment": "Discrete lab test results"},
    )

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("diagnostic_orders.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Denormalized for quick patient history",
    )
    
    parameter_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="E.g., Hemoglobin, Glucose",
    )
    
    value: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    
    unit: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
    )
    
    reference_range: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="E.g., 12.0 - 15.5",
    )
    
    is_abnormal: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="preliminary",
        comment="preliminary | final | amended",
    )
    
    validated_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )
    
    validated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationship ────────────────────────────────────────────
    order: Mapped["DiagnosticOrder"] = relationship(
        "DiagnosticOrder", back_populates="results"
    )


class ImagingResult(BaseModel):
    """
    Radiology reports and links to PACS/DICOM viewers.
    """

    __tablename__ = "imaging_results"
    __table_args__ = (
        Index("ix_imaging_order", "tenant_id", "order_id"),
        {"comment": "Radiology reports and image links"},
    )

    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("diagnostic_orders.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="Denormalized for quick patient history",
    )
    
    image_url: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Link to external PACS/DICOM viewer",
    )
    
    report: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Radiologist's interpreted report",
    )
    
    radiologist_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="draft",
        comment="draft | final | amended",
    )

    # ── Relationship ────────────────────────────────────────────
    order: Mapped["DiagnosticOrder"] = relationship(
        "DiagnosticOrder", back_populates="imaging_results"
    )
