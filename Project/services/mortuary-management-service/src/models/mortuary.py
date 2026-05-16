"""
MedTrustX Mortuary Management Service — Domain Entities

Five tables managing mortuary records, storage, body allocations, custody, and release.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class MortuaryRecord(BaseModel):
    """Primary record for a deceased patient."""
    __tablename__ = "mortuary_records"
    __table_args__ = (
        Index("ix_mm_record_patient", "tenant_id", "patient_id"),
        Index("ix_mm_record_status", "tenant_id", "status"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    date_of_death: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    cause: Mapped[str] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="received")  # received, stored, released


class StorageUnit(BaseModel):
    """Cold chambers or storage racks in the mortuary."""
    __tablename__ = "storage_units"

    unit_number: Mapped[str] = mapped_column(String(50), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="available")  # available, occupied, maintenance


class BodyAllocation(BaseModel):
    """Tracks which body is stored in which unit."""
    __tablename__ = "body_allocations"
    __table_args__ = (
        Index("ix_mm_allocation_storage", "tenant_id", "storage_unit_id"),
    )

    mortuary_record_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    storage_unit_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    allocated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class CustodyLog(BaseModel):
    """Strict chain of custody tracking."""
    __tablename__ = "custody_logs"
    __table_args__ = (
        Index("ix_mm_custody_record", "tenant_id", "mortuary_record_id"),
    )

    mortuary_record_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)  # body_received, body_moved, identification_verified, autopsy_performed, released
    performed_by: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    performed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class Release(BaseModel):
    """Final release documentation to family or legal authorities."""
    __tablename__ = "releases"
    __table_args__ = (
        Index("ix_mm_release_record", "tenant_id", "mortuary_record_id"),
    )

    mortuary_record_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    released_to: Mapped[str] = mapped_column(String(200), nullable=False)  # Name of family member or authority
    released_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="completed")
