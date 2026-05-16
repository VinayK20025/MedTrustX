"""
MedTrustX Prometheus Monitoring Service — Domain Entities

Postgres abstractions for PromQL tracking and alert configurations.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class MetricSeries(BaseModel):
    """Fallback storage for metric metadata if Prom is unreachable."""
    __tablename__ = "metrics_series"
    __table_args__ = (
        Index("ix_prom_metric_name", "tenant_id", "metric_name"),
        Index("ix_prom_metric_time", "timestamp"),
    )

    metric_name: Mapped[str] = mapped_column(String(255), nullable=False)
    labels: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    value: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class AlertRule(BaseModel):
    """PromQL rules defined specifically for MedTrustX alerts."""
    __tablename__ = "alert_rules"
    __table_args__ = (
        Index("ix_prom_rule_name", "tenant_id", "rule_name"),
    )

    rule_name: Mapped[str] = mapped_column(String(255), nullable=False)
    expression: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)


class AlertEvent(BaseModel):
    """Audit ledger of triggered PromQL alerts."""
    __tablename__ = "alert_events"
    __table_args__ = (
        Index("ix_prom_alert_rule", "tenant_id", "rule_id"),
    )

    rule_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False) # firing, resolved
    triggered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False
    )
