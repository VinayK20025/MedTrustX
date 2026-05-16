"""
MedTrustX ClickHouse Analytics Service — Domain Entities

Postgres fallbacks representing what would be ClickHouse MergeTrees in a real distributed setup.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class AnalyticsEvent(BaseModel):
    """Fallback representation of 'analytics_events' MergeTree."""
    __tablename__ = "analytics_events"
    __table_args__ = (
        Index("ix_ch_event_tenant_time", "tenant_id", "timestamp"),
    )

    event_type: Mapped[str] = mapped_column(String(255), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class DeviceMetric(BaseModel):
    """Fallback representation of 'device_metrics' MergeTree."""
    __tablename__ = "device_metrics"
    __table_args__ = (
        Index("ix_ch_metric_tenant_device", "tenant_id", "device_id", "timestamp"),
    )

    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    metric_name: Mapped[str] = mapped_column(String(255), nullable=False)
    metric_value: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class UserActivity(BaseModel):
    """Fallback representation of 'user_activity' MergeTree."""
    __tablename__ = "user_activity"
    __table_args__ = (
        Index("ix_ch_activity_tenant_user", "tenant_id", "user_id", "timestamp"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    metadata_json: Mapped[dict] = mapped_column(JSONB, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
