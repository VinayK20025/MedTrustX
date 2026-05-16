"""
MedTrustX Operational Command Center Service — Domain Entities

Postgres abstractions for incidents, commands, operational events, and control sessions.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Incident(BaseModel):
    """A detected operational incident requiring response."""
    __tablename__ = "incidents"
    __table_args__ = (
        Index("ix_incident_tenant_status", "tenant_id", "status"),
        Index("ix_incident_severity", "severity"),
    )

    type: Mapped[str] = mapped_column(String(100), nullable=False)  # system_failure, security_breach, performance_degradation, clinical_alert
    severity: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")  # critical, high, medium, low, info
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open")  # open, investigating, mitigating, resolved, closed


class Command(BaseModel):
    """An operational command issued by an operator against a target system."""
    __tablename__ = "commands"
    __table_args__ = (
        Index("ix_command_tenant_status", "tenant_id", "status"),
    )

    target_system: Mapped[str] = mapped_column(String(100), nullable=False)  # digital-twin, optimization-engine, notification-service
    action: Mapped[str] = mapped_column(String(100), nullable=False)  # restart, scale_up, isolate, redirect, trigger_simulation
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")  # pending, executing, completed, failed


class OperationalEvent(BaseModel):
    """A cross-system event ingested for correlation and situational awareness."""
    __tablename__ = "operational_events"
    __table_args__ = (
        Index("ix_opevent_type", "event_type"),
    )

    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    source: Mapped[str] = mapped_column(String(100), nullable=False)  # service name that emitted the event
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class ControlSession(BaseModel):
    """Tracks operator control sessions for audit."""
    __tablename__ = "control_sessions"

    operator_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
