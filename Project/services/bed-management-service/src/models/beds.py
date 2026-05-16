"""
MedTrustX Bed Management Service — Domain Entities

Tables:
  beds              – Hospital bed inventory with type and status lifecycle
  bed_allocations   – Patient-to-bed assignment tracking (admit/release)
  bed_reservations  – Pre-booking of beds for incoming patients
  bed_transfers     – Patient movement records between beds
  bed_status_logs   – Immutable audit trail of bed status transitions

Indexing Strategy:
  (tenant_id, status)   — capacity dashboard queries
  (patient_id)          — patient-centric bed lookup
  (bed_id)              — bed-centric history lookup
  (tenant_id, ward)     — department-level segmentation
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
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel


class Bed(BaseModel):
    """
    Hospital bed — the atomic unit of patient accommodation.

    Each bed belongs to a room (facilities-service) and has a type
    (general, icu, nicu, isolation, er, recovery, maternity) and a
    lifecycle status (available → occupied → cleaning → available).
    """

    __tablename__ = "beds"
    __table_args__ = (
        Index("ix_beds_status", "tenant_id", "status"),
        Index("ix_beds_room", "tenant_id", "room_id"),
        Index("ix_beds_type", "tenant_id", "type"),
        Index("ix_beds_ward", "tenant_id", "ward"),
        Index("ix_beds_number", "tenant_id", "bed_number", unique=True),
        {"comment": "Hospital bed inventory and status tracking"},
    )

    room_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="FK → facilities-service rooms (cross-service reference)",
    )

    bed_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Human-readable bed identifier (e.g., ICU-A-03, W2-B-12)",
    )

    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="general",
        server_default=text("'general'"),
        comment="general | icu | nicu | isolation | er | recovery | maternity | psychiatric",
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="available",
        server_default=text("'available'"),
        comment="available | occupied | reserved | cleaning | maintenance | blocked",
    )

    ward: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Ward or department grouping (e.g., Medical-ICU, Surgical-Ward-2)",
    )

    floor: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Floor/level within the building",
    )

    features: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Comma-separated features: ventilator, monitor, oxygen, suction, isolation_negative_pressure",
    )

    # ── Relationships ───────────────────────────────────────────
    allocations: Mapped[List["BedAllocation"]] = relationship(
        "BedAllocation", back_populates="bed", cascade="all, delete-orphan",
        order_by="BedAllocation.allocated_at.desc()",
    )
    reservations: Mapped[List["BedReservation"]] = relationship(
        "BedReservation", back_populates="bed", cascade="all, delete-orphan",
    )
    status_logs: Mapped[List["BedStatusLog"]] = relationship(
        "BedStatusLog", back_populates="bed", cascade="all, delete-orphan",
        order_by="BedStatusLog.updated_at.desc()",
    )


class BedAllocation(BaseModel):
    """
    Patient-to-bed assignment — tracks admissions, stays, and releases.

    Lifecycle: active → completed | cancelled
    An active allocation means the patient currently occupies the bed.
    """

    __tablename__ = "bed_allocations"
    __table_args__ = (
        Index("ix_alloc_bed", "tenant_id", "bed_id"),
        Index("ix_alloc_patient", "tenant_id", "patient_id"),
        Index("ix_alloc_status", "tenant_id", "status"),
        Index("ix_alloc_encounter", "tenant_id", "encounter_id"),
        {"comment": "Patient-to-bed allocation tracking"},
    )

    bed_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("beds.id", ondelete="CASCADE"),
        nullable=False,
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="FK → patient-service (cross-service reference)",
    )

    encounter_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="FK → clinical-service encounter (cross-service reference)",
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | completed | cancelled",
    )

    allocated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"),
        comment="When patient was assigned to this bed",
    )

    released_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="When patient vacated this bed",
    )

    admission_type: Mapped[Optional[str]] = mapped_column(
        String(30),
        nullable=True,
        default="planned",
        comment="planned | emergency | transfer_in | day_case",
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Allocation notes (e.g., isolation required, special equipment)",
    )

    # ── Relationships ───────────────────────────────────────────
    bed: Mapped["Bed"] = relationship("Bed", back_populates="allocations")


class BedReservation(BaseModel):
    """
    Pre-booking of a bed for an incoming patient — supports
    scheduled admissions, ER-to-ward transfers, and surgical holds.

    Lifecycle: pending → confirmed → fulfilled | cancelled | expired
    """

    __tablename__ = "bed_reservations"
    __table_args__ = (
        Index("ix_resv_bed", "tenant_id", "bed_id"),
        Index("ix_resv_status", "tenant_id", "status"),
        Index("ix_resv_ref", "tenant_id", "reference_id"),
        {"comment": "Bed pre-booking and reservation management"},
    )

    bed_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("beds.id", ondelete="CASCADE"),
        nullable=False,
    )

    reserved_for: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Purpose: scheduled_admission | er_transfer | surgical_hold | icu_step_down | external_transfer",
    )

    reference_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="FK → source entity (appointment_id, er_case_id, surgery_id)",
    )

    patient_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="FK → patient-service (if known at reservation time)",
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        server_default=text("'pending'"),
        comment="pending | confirmed | fulfilled | cancelled | expired",
    )

    reserved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"),
    )

    expected_arrival: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="When the patient is expected to occupy the bed",
    )

    expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Auto-expiry time for unfulfilled reservations",
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    bed: Mapped["Bed"] = relationship("Bed", back_populates="reservations")


class BedTransfer(BaseModel):
    """
    Patient movement from one bed to another — captures the transfer
    event with source and destination beds.

    Reasons: upgrade (ward → ICU), step_down (ICU → ward), room_change,
    isolation, patient_request, maintenance_forced
    """

    __tablename__ = "bed_transfers"
    __table_args__ = (
        Index("ix_xfer_from", "tenant_id", "from_bed_id"),
        Index("ix_xfer_to", "tenant_id", "to_bed_id"),
        Index("ix_xfer_patient", "tenant_id", "patient_id"),
        Index("ix_xfer_time", "transferred_at"),
        {"comment": "Bed-to-bed patient transfer records"},
    )

    from_bed_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("beds.id", ondelete="SET NULL"),
        nullable=False,
    )

    to_bed_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("beds.id", ondelete="SET NULL"),
        nullable=False,
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
        comment="FK → patient-service",
    )

    transferred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"),
    )

    reason: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="upgrade | step_down | room_change | isolation | patient_request | maintenance_forced",
    )

    initiated_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Staff member who initiated the transfer (FK → IAM)",
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    from_bed: Mapped["Bed"] = relationship("Bed", foreign_keys=[from_bed_id])
    to_bed: Mapped["Bed"] = relationship("Bed", foreign_keys=[to_bed_id])


class BedStatusLog(BaseModel):
    """
    Immutable audit trail for bed status transitions — tracks every
    status change with timestamp and actor for compliance.
    """

    __tablename__ = "bed_status_logs"
    __table_args__ = (
        Index("ix_bsl_bed", "tenant_id", "bed_id"),
        Index("ix_bsl_time", "updated_at"),
        {"comment": "Immutable bed status change audit trail"},
    )

    bed_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("beds.id", ondelete="CASCADE"),
        nullable=False,
    )

    old_status: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Previous status (NULL for initial creation)",
    )

    new_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="New status after transition",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"),
    )

    changed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="User who triggered the status change (FK → IAM)",
    )

    reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Reason for status change",
    )

    # ── Relationships ───────────────────────────────────────────
    bed: Mapped["Bed"] = relationship("Bed", back_populates="status_logs")
