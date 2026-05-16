"""
MedTrustX Grafana Visualization Service — Domain Entities

Configuration mapping for panels, dashboards, and visual alerts.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Dashboard(BaseModel):
    """Stores structural configuration for a specific UI dashboard."""
    __tablename__ = "dashboards"
    __table_args__ = (
        Index("ix_grafana_dashboard_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class Panel(BaseModel):
    """Maps to individual charts or tables within a Dashboard."""
    __tablename__ = "panels"
    __table_args__ = (
        Index("ix_grafana_panel_dashboard", "tenant_id", "dashboard_id"),
    )

    dashboard_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    panel_type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g., 'timeseries', 'stat', 'table'
    query: Mapped[str] = mapped_column(String, nullable=True) # PromQL or ClickHouse SQL
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class DataSource(BaseModel):
    """Registered upstream databases for Grafana to query."""
    __tablename__ = "data_sources"
    __table_args__ = (
        Index("ix_grafana_datasource_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False) # e.g., 'prometheus', 'clickhouse'
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class AlertVisualization(BaseModel):
    """Maps a Prometheus Alert rule to a specific visual dashboard panel."""
    __tablename__ = "alert_visualizations"
    __table_args__ = (
        Index("ix_grafana_alert_dash", "tenant_id", "alert_id", "dashboard_id"),
    )

    alert_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    dashboard_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
