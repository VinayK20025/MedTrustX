"""
MedTrustX Loki Logging Service — Domain Entities

Postgres abstractions for label-based log storage, similar to Loki streams.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class LogStream(BaseModel):
    """Metadata tracking unique combinations of labels (equivalent to Loki streams)."""
    __tablename__ = "log_streams"
    __table_args__ = (
        Index("ix_loki_stream_tenant", "tenant_id"),
    )

    labels: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class LogEntry(BaseModel):
    """The raw log line payload."""
    __tablename__ = "log_entries"
    __table_args__ = (
        Index("ix_loki_entry_stream_time", "tenant_id", "stream_id", "timestamp"),
    )

    stream_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    log: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class LogIndex(BaseModel):
    """Reverse index allowing rapid search across streams by specific label key/values."""
    __tablename__ = "log_indexes"
    __table_args__ = (
        Index("ix_loki_index_label", "tenant_id", "label_key", "label_value"),
    )

    label_key: Mapped[str] = mapped_column(String(100), nullable=False)
    label_value: Mapped[str] = mapped_column(String(255), nullable=False)
    stream_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
