"""
MedTrustX SLA & Service Health Manager Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class SlaDefinition(BaseModel):
    """Configuration for a specific service's SLA."""
    __tablename__ = "slas"
    __table_args__ = (
        Index("ix_sla_tenant_service", "tenant_id", "service_name"),
    )
    service_name: Mapped[str] = mapped_column(String(255), nullable=False)
    uptime_target: Mapped[float] = mapped_column(Float, nullable=False, default=99.9) # Percentage
    latency_target: Mapped[float] = mapped_column(Float, nullable=False, default=200.0) # ms

class ServiceHealth(BaseModel):
    """Current health state and rolling score for a service."""
    __tablename__ = "service_health"
    __table_args__ = (
        Index("ix_health_tenant_service", "tenant_id", "service_name"),
        Index("ix_health_status", "status"),
    )
    service_name: Mapped[str] = mapped_column(String(255), nullable=False)
    health_score: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="healthy") # healthy, degraded, critical

class SlaViolation(BaseModel):
    """Log of detected SLA breaches."""
    __tablename__ = "sla_violations"
    __table_args__ = (
        Index("ix_violation_tenant_sla", "tenant_id", "sla_id"),
        Index("ix_violation_detected_at", "detected_at"),
    )
    sla_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    violation_type: Mapped[str] = mapped_column(String(100), nullable=False) # latency, uptime, error_rate
    severity: Mapped[str] = mapped_column(String(50), nullable=False) # low, medium, high, critical
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class HealthEvent(BaseModel):
    """Raw telemetry inputs driving the SLA evaluations."""
    __tablename__ = "health_events"
    __table_args__ = (
        Index("ix_event_tenant_service", "tenant_id", "service_name"),
    )
    service_name: Mapped[str] = mapped_column(String(255), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
