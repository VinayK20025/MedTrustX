"""
MedTrustX Jaeger Tracing Service — Domain Entities

Postgres abstractions for distributed tracing metadata.
"""
from datetime import datetime, timezone

from sqlalchemy import BigInteger, DateTime, Index, Integer, String, text
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Trace(BaseModel):
    """Represents a complete end-to-end request lifecycle."""
    __tablename__ = "traces"
    __table_args__ = (
        Index("ix_jaeger_trace_id", "tenant_id", "trace_id"),
        Index("ix_jaeger_trace_svc", "tenant_id", "service_name"),
        Index("ix_jaeger_trace_time", "started_at"),
    )

    trace_id: Mapped[str] = mapped_column(String(100), nullable=False)
    service_name: Mapped[str] = mapped_column(String(100), nullable=False)
    duration: Mapped[int] = mapped_column(BigInteger, nullable=False) # In microseconds
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Span(BaseModel):
    """Represents a single operation within a trace."""
    __tablename__ = "spans"
    __table_args__ = (
        Index("ix_jaeger_span_trace", "tenant_id", "trace_id"),
    )

    trace_id: Mapped[str] = mapped_column(String(100), nullable=False)
    span_id: Mapped[str] = mapped_column(String(100), nullable=False)
    parent_span_id: Mapped[str] = mapped_column(String(100), nullable=True)
    operation_name: Mapped[str] = mapped_column(String(255), nullable=False)
    duration: Mapped[int] = mapped_column(BigInteger, nullable=False) # In microseconds
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Dependency(BaseModel):
    """Tracks service-to-service communication edges for topology graphs."""
    __tablename__ = "dependencies"
    __table_args__ = (
        Index("ix_jaeger_dep_parent", "tenant_id", "parent_service"),
    )

    parent_service: Mapped[str] = mapped_column(String(100), nullable=False)
    child_service: Mapped[str] = mapped_column(String(100), nullable=False)
    call_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
