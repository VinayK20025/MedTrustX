"""
MedTrustX Devices & IoMT Service — Domain Entities

Tables:
  devices             – Physical medical devices (ventilators, monitors, pumps)
  device_assignments  – Temporal links binding a device to a patient
  device_telemetry    – High-frequency stream data
  device_alerts       – Threshold breaches or device hardware faults
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


class Device(BaseModel):
    """
    Registry of physical medical hardware.
    """

    __tablename__ = "devices"
    __table_args__ = (
        Index("ix_devices_tenant_type", "tenant_id", "device_type"),
        Index("ix_devices_status", "tenant_id", "status"),
        {"comment": "IoMT Device Registry"},
    )

    device_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="ventilator | patient_monitor | infusion_pump | wearable",
    )
    
    manufacturer: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    
    model: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | maintenance | retired | offline",
    )
    
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    # ── Relationships ───────────────────────────────────────────
    assignments: Mapped[List["DeviceAssignment"]] = relationship(
        "DeviceAssignment", back_populates="device"
    )
    telemetry: Mapped[List["DeviceTelemetry"]] = relationship(
        "DeviceTelemetry", back_populates="device"
    )
    alerts: Mapped[List["DeviceAlert"]] = relationship(
        "DeviceAlert", back_populates="device"
    )


class DeviceAssignment(BaseModel):
    """
    Temporal link binding a device to a specific patient to map telemetry.
    """

    __tablename__ = "device_assignments"
    __table_args__ = (
        Index("ix_assignment_active", "tenant_id", "device_id", "unassigned_at"),
        Index("ix_assignment_patient", "tenant_id", "patient_id"),
        {"comment": "Patient-Device linkage"},
    )

    device_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("devices.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    
    unassigned_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    device: Mapped["Device"] = relationship(
        "Device", back_populates="assignments"
    )


class DeviceTelemetry(BaseModel):
    """
    Time-series payload. In a real highly-scaled system, this table
    might be backed by TimescaleDB or entirely routed to an OLAP store.
    """

    __tablename__ = "device_telemetry"
    __table_args__ = (
        Index("ix_telemetry_device_time", "tenant_id", "device_id", "recorded_at"),
        {"comment": "Raw signal data"},
    )

    device_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("devices.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    metric: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="heart_rate | spo2 | respiratory_rate | tidal_volume",
    )
    
    value: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Stringified value to accommodate mixed types",
    )
    
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    # ── Relationships ───────────────────────────────────────────
    device: Mapped["Device"] = relationship(
        "Device", back_populates="telemetry"
    )


class DeviceAlert(BaseModel):
    """
    Hardware faults or clinical threshold breaches triggered by the device itself.
    """

    __tablename__ = "device_alerts"
    __table_args__ = (
        Index("ix_alerts_device_severity", "tenant_id", "device_id", "severity"),
        {"comment": "Device-generated alerts"},
    )

    device_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("devices.id", ondelete="CASCADE"),
        nullable=False,
    )

    alert_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="hardware_fault | threshold_breach | disconnect",
    )
    
    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="info | warning | critical",
    )
    
    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    
    triggered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── Relationships ───────────────────────────────────────────
    device: Mapped["Device"] = relationship(
        "Device", back_populates="alerts"
    )
