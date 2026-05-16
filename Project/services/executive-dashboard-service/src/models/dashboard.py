"""
MedTrustX Executive Dashboard Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class Dashboard(BaseModel):
    """Configuration and layout of an executive dashboard view."""
    __tablename__ = "dashboards"
    __table_args__ = (
        Index("ix_dash_tenant_name", "tenant_id", "name"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class KPI(BaseModel):
    """Aggregated numerical metrics ingested from cross-domain systems."""
    __tablename__ = "kpis"
    __table_args__ = (
        Index("ix_kpi_tenant_name", "tenant_id", "name"),
        Index("ix_kpi_timestamp", "timestamp"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class DashboardWidget(BaseModel):
    """Specific visualization components (graphs, charts) attached to a Dashboard."""
    __tablename__ = "dashboard_widgets"
    __table_args__ = (
        Index("ix_widget_tenant_dash", "tenant_id", "dashboard_id"),
    )
    dashboard_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    widget_type: Mapped[str] = mapped_column(String(100), nullable=False) # line_chart, gauge, heatmap
    config: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class AccessLog(BaseModel):
    """Audit logging tracking which executive viewed what data and when."""
    __tablename__ = "access_logs"
    __table_args__ = (
        Index("ix_accesslog_tenant_dash", "tenant_id", "dashboard_id"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    dashboard_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
