"""
MedTrustX Fire & Safety Systems Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class SafetyDevice(BaseModel):
    """Sensors (smoke, gas, heat) or controllers (sprinklers, alarms)."""
    __tablename__ = "safety_devices"
    device_type: Mapped[str] = mapped_column(String(100), nullable=False) # smoke, heat, sprinkler
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="operational")

class SafetyEvent(BaseModel):
    """Readings or triggers emitted by safety devices."""
    __tablename__ = "safety_events"
    __table_args__ = (
        Index("ix_sevent_tenant_device", "tenant_id", "device_id"),
        Index("ix_sevent_severity", "severity"),
    )
    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False) # info, warning, critical
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class EmergencyAction(BaseModel):
    """Automated or manual control actions executed in response to safety events."""
    __tablename__ = "emergency_actions"
    action_type: Mapped[str] = mapped_column(String(100), nullable=False) # trigger_alarm, deploy_sprinklers
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="triggered")
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class EvacuationLog(BaseModel):
    """Tracks the status of evacuation workflows per zone."""
    __tablename__ = "evacuation_logs"
    zone: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="in_progress")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
