"""
MedTrustX Performance Intelligence Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class PerformanceMetric(BaseModel):
    """Raw normalized performance data points ingested from Prometheus / OTLP."""
    __tablename__ = "performance_metrics"
    __table_args__ = (
        Index("ix_pm_tenant_svc", "tenant_id", "service_name"),
        Index("ix_pm_metric", "metric_name"),
        Index("ix_pm_ts", "timestamp"),
    )
    service_name: Mapped[str] = mapped_column(String(255), nullable=False)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False) # p99_latency, error_rate, throughput
    value: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class Benchmark(BaseModel):
    """Baseline reference values for cross-service performance comparison."""
    __tablename__ = "benchmarks"
    __table_args__ = (
        Index("ix_bm_tenant_svc", "tenant_id", "service_name"),
    )
    service_name: Mapped[str] = mapped_column(String(255), nullable=False)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    baseline: Mapped[float] = mapped_column(Float, nullable=False)

class PerformanceScore(BaseModel):
    """Composite score summarising a service's overall health."""
    __tablename__ = "performance_scores"
    __table_args__ = (
        Index("ix_ps_tenant_svc", "tenant_id", "service_name"),
    )
    service_name: Mapped[str] = mapped_column(String(255), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False) # 0.0 – 1.0
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class OptimizationInsight(BaseModel):
    """Actionable recommendation generated from performance analysis."""
    __tablename__ = "optimization_insights"
    __table_args__ = (
        Index("ix_oi_tenant_svc", "tenant_id", "service_name"),
    )
    service_name: Mapped[str] = mapped_column(String(255), nullable=False)
    insight: Mapped[str] = mapped_column(Text, nullable=False)
    impact: Mapped[float] = mapped_column(Float, nullable=False) # expected improvement factor
