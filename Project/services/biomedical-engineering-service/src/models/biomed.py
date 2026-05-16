"""
MedTrustX Biomedical Engineering Service — Domain Entities

Five tables orchestrating devices, maintenance, calibration, usage, and incidents.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Device(BaseModel):
    """A registered medical device/asset (e.g., ventilator, infusion pump)."""
    __tablename__ = "devices"
    __table_args__ = (
        Index("ix_bme_dev_status", "tenant_id", "status"),
        Index("ix_bme_dev_type", "tenant_id", "device_type"),
    )

    device_name: Mapped[str] = mapped_column(String(100), nullable=False)
    device_type: Mapped[str] = mapped_column(String(50), nullable=False)
    serial_number: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active, maintenance, decommissioned


class MaintenanceRecord(BaseModel):
    """Log of preventive or corrective maintenance performed on a device."""
    __tablename__ = "maintenance_records"
    __table_args__ = (
        Index("ix_bme_maint_dev", "tenant_id", "device_id"),
        Index("ix_bme_maint_status", "tenant_id", "status"),
    )

    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    maintenance_type: Mapped[str] = mapped_column(String(50), nullable=False)  # preventive, corrective
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="scheduled")  # scheduled, in_progress, completed
    performed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Calibration(BaseModel):
    """Record of device accuracy verification against standards."""
    __tablename__ = "calibrations"
    __table_args__ = (
        Index("ix_bme_calib_dev", "tenant_id", "device_id"),
    )

    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    calibration_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    next_due_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="valid")  # valid, expired


class DeviceUsage(BaseModel):
    """Tracking metric for how heavily a device is being utilized."""
    __tablename__ = "device_usage"
    __table_args__ = (
        Index("ix_bme_usage_dev", "tenant_id", "device_id"),
    )

    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    usage_hours: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class DeviceIncident(BaseModel):
    """Failure, malfunction, or safety incident reported for a device."""
    __tablename__ = "device_incidents"
    __table_args__ = (
        Index("ix_bme_inc_dev", "tenant_id", "device_id"),
    )

    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    incident_type: Mapped[str] = mapped_column(String(100), nullable=False)  # malfunction, safety_alert
    severity: Mapped[str] = mapped_column(String(20), nullable=False)  # low, medium, high, critical
    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
