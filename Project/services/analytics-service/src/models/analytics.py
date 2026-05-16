"""
MedTrustX Analytics Service — Domain Entities

Five tables spanning the full analytics lifecycle: raw event ingestion,
aggregated KPIs, generated reports, ML predictions, and dashboard configs.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class AnalyticsEvent(BaseModel):
    """Raw events ingested from all platform services."""
    __tablename__ = "analytics_events"
    __table_args__ = (
        Index("ix_ae_type", "tenant_id", "event_type"),
        Index("ix_ae_source", "source_service"),
    )

    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    source_service: Mapped[str] = mapped_column(String(50), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class AggregatedMetric(BaseModel):
    """Pre-computed KPI / metric values (e.g. icu_occupancy, avg_wait_time)."""
    __tablename__ = "aggregated_metrics"
    __table_args__ = (
        Index("ix_am_name", "tenant_id", "metric_name"),
    )

    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    dimensions: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class AnalyticsReport(BaseModel):
    """Generated analytical reports (daily, weekly, ad-hoc)."""
    __tablename__ = "analytics_reports"

    report_type: Mapped[str] = mapped_column(String(100), nullable=False)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class Prediction(BaseModel):
    """ML model prediction results tied to domain entities."""
    __tablename__ = "predictions"
    __table_args__ = (
        Index("ix_pred_entity", "tenant_id", "entity_id"),
    )

    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    prediction: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class Dashboard(BaseModel):
    """Saved dashboard configurations."""
    __tablename__ = "dashboards"
    __table_args__ = (
        Index("ix_dash_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
