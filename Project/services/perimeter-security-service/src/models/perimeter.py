"""
MedTrustX Perimeter Security Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class PerimeterZone(BaseModel):
    """Defined boundary zones for exterior monitoring."""
    __tablename__ = "perimeter_zones"
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    boundary: Mapped[dict] = mapped_column(JSONB, nullable=False, default={}) # GeoJSON or polygon array

class Sensor(BaseModel):
    """External boundary monitoring hardware (LiDAR, fence sensor, radar)."""
    __tablename__ = "sensors"
    __table_args__ = (
        Index("ix_sensor_zone", "zone_id"),
    )
    zone_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    sensor_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

class IntrusionEvent(BaseModel):
    """Events triggered when a boundary sensor detects unauthorized presence."""
    __tablename__ = "intrusion_events"
    __table_args__ = (
        Index("ix_ievent_tenant_zone", "tenant_id", "zone_id"),
        Index("ix_ievent_severity", "severity"),
    )
    zone_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False) # fence_cut, motion_detected
    severity: Mapped[str] = mapped_column(String(50), nullable=False) # warning, critical

class ResponseAction(BaseModel):
    """Automated counter-measures triggered by intrusion events."""
    __tablename__ = "response_actions"
    event_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    action_type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. activate_floodlights
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="triggered")
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
