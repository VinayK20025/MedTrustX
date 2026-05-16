"""
MedTrustX Network Management Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, Index, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class ManagedDevice(BaseModel):
    """Monitored network devices (routers, switches, firewalls)."""
    __tablename__ = "network_devices"
    device_type: Mapped[str] = mapped_column(String(100), nullable=False)
    ip_address: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="online")

class DeviceMetric(BaseModel):
    """Time-series telemetry for devices (CPU, bandwidth, latency)."""
    __tablename__ = "device_metrics"
    __table_args__ = (
        Index("ix_metric_tenant_device", "tenant_id", "device_id"),
        Index("ix_metric_name_time", "metric_name", "timestamp"),
    )
    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class NetworkTopology(BaseModel):
    """Edges defining physical/logical connections between devices."""
    __tablename__ = "network_topology"
    source_device: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    target_device: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    link_status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

class FaultEvent(BaseModel):
    """Network errors, link-downs, or hardware failures."""
    __tablename__ = "fault_events"
    __table_args__ = (
        Index("ix_fault_tenant_device", "tenant_id", "device_id"),
        Index("ix_fault_type", "fault_type"),
    )
    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    fault_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False) # warning, critical
