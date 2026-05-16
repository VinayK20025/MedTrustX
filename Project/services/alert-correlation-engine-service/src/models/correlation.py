"""
MedTrustX Alert Correlation Engine Service — Domain Entities

Postgres abstractions for alerts, correlated incidents, mappings, and suppression rules.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Alert(BaseModel):
    """A raw alert ingested from any monitoring source."""
    __tablename__ = "alerts"
    __table_args__ = (
        Index("ix_alert_tenant_source", "tenant_id", "source"),
        Index("ix_alert_severity", "severity"),
    )

    source: Mapped[str] = mapped_column(String(100), nullable=False)  # prometheus, loki, jaeger, iot-messaging
    type: Mapped[str] = mapped_column(String(100), nullable=False)  # cpu_high, disk_full, latency_spike, device_offline
    severity: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")  # critical, high, medium, low, info
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class CorrelatedIncident(BaseModel):
    """A unified incident formed by correlating multiple related alerts."""
    __tablename__ = "correlated_incidents"
    __table_args__ = (
        Index("ix_corrinc_tenant_key", "tenant_id", "incident_key"),
        Index("ix_corrinc_severity", "severity"),
    )

    incident_key: Mapped[str] = mapped_column(String(255), nullable=False)  # deterministic correlation key
    root_cause: Mapped[str | None] = mapped_column(String(255), nullable=True)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open")  # open, investigating, resolved, closed


class AlertMapping(BaseModel):
    """Maps an individual alert to a correlated incident with a confidence score."""
    __tablename__ = "alert_mappings"
    __table_args__ = (
        Index("ix_alertmap_alert", "alert_id"),
    )

    alert_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    incident_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    correlation_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)


class SuppressionRule(BaseModel):
    """A rule defining conditions under which alerts should be suppressed/deduplicated."""
    __tablename__ = "suppression_rules"

    rule_name: Mapped[str] = mapped_column(String(255), nullable=False)
    conditions: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
