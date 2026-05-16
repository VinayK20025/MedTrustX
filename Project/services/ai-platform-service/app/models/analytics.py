"""
app/models/analytics.py
========================
Pydantic request/response schemas for the analytics endpoints.

All models use ``model_config = ConfigDict(strict=True)``.

Endpoints covered:
  GET /api/ai/analytics/vitals
  GET /api/ai/analytics/population
  GET /api/ai/analytics/resource-usage
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(strict=True, populate_by_name=True)


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/analytics/vitals
# ═══════════════════════════════════════════════════════════════════════════════

class VitalsAnalyticsParams(StrictModel):
    """Query parameters for the vitals analytics endpoint."""

    tenant_id: str = Field(..., min_length=3, max_length=64)
    patient_id: str | None = Field(None, description="Optional patient filter.")
    vital_type: str = Field(
        ...,
        description="Vital type string (e.g. 'Heart rate', 'SpO2', 'BP Systolic').",
    )
    start_date: datetime = Field(..., description="Range start (ISO-8601 UTC).")
    end_date: datetime = Field(..., description="Range end (ISO-8601 UTC).")
    aggregation: str = Field(
        default="day",
        description="Time bucket granularity: 'hour', 'day', or 'week'.",
    )
    page: int = Field(default=1, ge=1, description="Page number (1-indexed).")
    page_size: int = Field(
        default=100, ge=1, le=1000, description="Rows per page (max 1000)."
    )

    @field_validator("aggregation")
    @classmethod
    def valid_aggregation(cls, v: str) -> str:
        allowed = {"hour", "day", "week"}
        if v not in allowed:
            raise ValueError(f"aggregation must be one of {allowed}, got {v!r}")
        return v

    @field_validator("end_date", mode="after")
    @classmethod
    def end_after_start(cls, v: datetime, info: Any) -> datetime:
        start = info.data.get("start_date")
        if start and v <= start:
            raise ValueError("end_date must be after start_date")
        return v


class VitalsDataPoint(StrictModel):
    """A single aggregated vitals data point."""

    bucket: datetime = Field(..., description="Time bucket start (UTC).")
    avg_value: float = Field(..., description="Average vital value in bucket.")
    min_value: float = Field(..., description="Minimum value in bucket.")
    max_value: float = Field(..., description="Maximum value in bucket.")
    std_value: float | None = Field(None, description="Standard deviation in bucket.")
    sample_count: int = Field(..., description="Number of readings in bucket.")


class VitalsAnalyticsResponse(StrictModel):
    """Paginated vitals time-series response."""

    tenant_id: str
    patient_id: str | None
    vital_type: str
    aggregation: str
    start_date: datetime
    end_date: datetime
    data: list[VitalsDataPoint] = Field(..., description="Aggregated time-series data.")
    total_count: int = Field(..., description="Total matching data points (unpaginated).")
    page: int
    page_size: int
    cached: bool = Field(
        default=False, description="True if the response was served from Redis cache."
    )


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/analytics/population
# ═══════════════════════════════════════════════════════════════════════════════

class PopulationAnalyticsParams(StrictModel):
    """Query parameters for the population analytics endpoint."""

    tenant_id: str = Field(..., min_length=3, max_length=64)
    risk_label: str | None = Field(
        None, description="Filter by risk label: 'low', 'medium', or 'high'."
    )
    department: str | None = Field(None, description="Optional department filter.")

    @field_validator("risk_label")
    @classmethod
    def valid_risk_label(cls, v: str | None) -> str | None:
        if v is not None and v not in {"low", "medium", "high"}:
            raise ValueError("risk_label must be 'low', 'medium', or 'high'")
        return v


class RiskHistogramBucket(StrictModel):
    """A single bucket in the risk score histogram."""

    bucket: str = Field(..., description="Risk score range label (e.g. '0.6–0.7').")
    count: int = Field(..., description="Number of patients in this risk range.")
    avg_risk_score: float = Field(..., description="Average risk score in bucket.")


class PopulationAnalyticsResponse(StrictModel):
    """Population-level readmission risk distribution."""

    tenant_id: str
    risk_label_filter: str | None
    department_filter: str | None
    histogram: list[RiskHistogramBucket] = Field(
        ..., description="Risk score distribution across 10 buckets (0.0–1.0)."
    )
    high_risk_count: int = Field(..., description="Total high-risk patients.")
    medium_risk_count: int = Field(..., description="Total medium-risk patients.")
    low_risk_count: int = Field(..., description="Total low-risk patients.")
    avg_risk_score: float = Field(..., description="Population-wide average risk score.")
    total_patients: int = Field(..., description="Total assessed patients.")
    trend_7d_pct: float | None = Field(
        None,
        description="7-day trend: positive = worsening, negative = improving (%).",
    )
    cached: bool = Field(default=False)


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/analytics/resource-usage
# ═══════════════════════════════════════════════════════════════════════════════

class ModelUsageHourly(StrictModel):
    """Hourly inference request count for a specific model."""

    model_name: str = Field(..., description="ML model name.")
    hour: datetime = Field(..., description="UTC hour bucket.")
    request_count: int = Field(..., description="Total inference requests in this hour.")
    error_count: int = Field(..., description="Inference errors in this hour.")
    fallback_count: int = Field(..., description="Fallback (rule-based) invocations.")


class ModelLatencyStats(StrictModel):
    """Average inference latency for a model (last 24 hours)."""

    model_name: str
    avg_latency_ms: float = Field(..., description="Average end-to-end latency (ms).")
    p50_latency_ms: float = Field(..., description="50th percentile latency (ms).")
    p95_latency_ms: float = Field(..., description="95th percentile latency (ms).")
    p99_latency_ms: float = Field(..., description="99th percentile latency (ms).")
    total_requests: int = Field(..., description="Total requests in last 24h.")


class ResourceUsageResponse(StrictModel):
    """Model inference resource usage statistics."""

    period_hours: int = Field(default=24, description="Look-back window in hours.")
    hourly_counts: list[ModelUsageHourly] = Field(
        ..., description="Per-model, per-hour inference counts."
    )
    latency_stats: list[ModelLatencyStats] = Field(
        ..., description="Per-model latency percentiles."
    )
    active_websocket_connections: int = Field(
        ..., description="Current WebSocket connection count."
    )
    feature_cache_hit_ratio: float = Field(
        ..., ge=0.0, le=1.0, description="Feature cache hit ratio (0.0–1.0)."
    )
    generated_at: datetime = Field(..., description="Timestamp of this report.")
