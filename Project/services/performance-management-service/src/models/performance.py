"""
MedTrustX Performance Management Service — Domain Entities

Five tables orchestrating KPIs, performance records, scorecards, benchmarks, and evaluations.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, Text, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class KPI(BaseModel):
    """A Key Performance Indicator definition."""
    __tablename__ = "kpis"
    __table_args__ = (
        Index("ix_pm_kpi_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    target_value: Mapped[float] = mapped_column(Float, nullable=False)


class PerformanceRecord(BaseModel):
    """A specific recorded value for a KPI tied to an entity."""
    __tablename__ = "performance_records"
    __table_args__ = (
        Index("ix_pm_rec_kpi", "tenant_id", "kpi_id"),
        Index("ix_pm_rec_entity", "tenant_id", "entity_id"),
    )

    entity_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # user, department, hospital
    kpi_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class Scorecard(BaseModel):
    """An aggregated performance scorecard for a user/period."""
    __tablename__ = "scorecards"
    __table_args__ = (
        Index("ix_pm_score_user", "tenant_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    period: Mapped[str] = mapped_column(String(50), nullable=False)  # Q1-2026, 2026-04
    score: Mapped[float] = mapped_column(Float, nullable=False)


class Benchmark(BaseModel):
    """A standard/benchmark value for a specific KPI."""
    __tablename__ = "benchmarks"
    __table_args__ = (
        Index("ix_pm_bench_kpi", "tenant_id", "kpi_id"),
    )

    kpi_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    benchmark_value: Mapped[float] = mapped_column(Float, nullable=False)


class Evaluation(BaseModel):
    """A human-recorded performance evaluation/appraisal."""
    __tablename__ = "evaluations"
    __table_args__ = (
        Index("ix_pm_eval_user", "tenant_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    evaluator_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    comments: Mapped[str] = mapped_column(Text, nullable=False, default="")
    evaluated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
