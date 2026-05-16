"""
MedTrustX Resource Optimization Engine Service — Domain Entities

Postgres abstractions for resources, allocations, optimization runs and results.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Resource(BaseModel):
    """A managed resource (bed, staff, equipment, fleet vehicle)."""
    __tablename__ = "resources"
    __table_args__ = (
        Index("ix_resopt_resource_tenant", "tenant_id", "resource_type"),
        Index("ix_resopt_resource_status", "status"),
    )

    resource_type: Mapped[str] = mapped_column(String(100), nullable=False)  # bed, staff, equipment, vehicle
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="available")  # available, allocated, maintenance
    metadata: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})


class Allocation(BaseModel):
    """An assignment of a resource to an entity over a time window."""
    __tablename__ = "allocations"
    __table_args__ = (
        Index("ix_resopt_alloc_resource", "tenant_id", "resource_id"),
        Index("ix_resopt_alloc_status", "status"),
    )

    resource_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    assigned_to: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")  # active, completed, cancelled


class OptimizationRun(BaseModel):
    """A single optimization computation session."""
    __tablename__ = "optimization_runs"
    __table_args__ = (
        Index("ix_resopt_run_status", "status"),
    )

    run_type: Mapped[str] = mapped_column(String(100), nullable=False)  # capacity_planning, scheduling, rebalancing
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, running, completed, failed
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class OptimizationResult(BaseModel):
    """Output from an optimization run."""
    __tablename__ = "optimization_results"
    __table_args__ = (
        Index("ix_resopt_result_run", "tenant_id", "run_id"),
    )

    run_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    result: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
