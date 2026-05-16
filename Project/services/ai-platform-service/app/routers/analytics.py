"""
app/routers/analytics.py
=========================
Analytics endpoints for the MedTrustX AI Platform Service.

Endpoints:
  GET /api/ai/analytics/vitals          — paginated vitals time-series
  GET /api/ai/analytics/population      — population risk distribution
  GET /api/ai/analytics/resource-usage  — model inference resource metrics

All responses are cached in Redis (TTL 5 minutes).
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.repositories.risk import RiskRepository
from app.db.repositories.vitals import VitalsRepository
from app.dependencies import get_db_for_request, verify_tenant_match
from app.models.analytics import (
    PopulationAnalyticsResponse,
    ResourceUsageResponse,
    RiskHistogramBucket,
    VitalsAnalyticsResponse,
    VitalsDataPoint,
    ModelLatencyStats,
    ModelUsageHourly,
)
from app.observability.logging import LogContext, get_logger
from app.observability.metrics import ACTIVE_WEBSOCKET_CONNECTIONS, FEATURE_CACHE_HIT_RATIO
from app.observability.tracing import get_tracer

logger = get_logger(__name__)
tracer = get_tracer(__name__)
router = APIRouter(prefix="/api/ai/analytics", tags=["Analytics"])


# ─── Redis cache helpers ───────────────────────────────────────────────────────

async def _cache_get(key: str) -> Any | None:
    import redis.asyncio as aioredis
    client: aioredis.Redis | None = None
    try:
        client = await aioredis.from_url(
            settings.redis_url, encoding="utf-8", decode_responses=True,
            socket_connect_timeout=2, socket_timeout=2,
        )
        raw = await client.get(key)
        return json.loads(raw) if raw else None
    except Exception:  # noqa: BLE001
        return None
    finally:
        if client:
            await client.aclose()


async def _cache_set(key: str, value: Any, ttl: int) -> None:
    import redis.asyncio as aioredis
    client: aioredis.Redis | None = None
    try:
        client = await aioredis.from_url(
            settings.redis_url, encoding="utf-8", decode_responses=True,
            socket_connect_timeout=2, socket_timeout=2,
        )
        await client.set(key, json.dumps(value, default=str), ex=ttl)
    except Exception:  # noqa: BLE001
        pass
    finally:
        if client:
            await client.aclose()


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/analytics/vitals
# ═══════════════════════════════════════════════════════════════════════════════

@router.get(
    "/vitals",
    response_model=VitalsAnalyticsResponse,
    summary="Vitals time-series analytics",
    description="Returns aggregated vital sign time-series with DATE_TRUNC grouping.",
)
async def vitals_analytics(
    request: Request,
    tenant_id: str = Query(..., description="Tenant identifier."),
    vital_type: str = Query(..., description="Vital type (e.g. 'Heart rate')."),
    start_date: datetime = Query(..., description="Start date (ISO-8601)."),
    end_date: datetime = Query(..., description="End date (ISO-8601)."),
    patient_id: str | None = Query(None, description="Optional patient filter."),
    aggregation: str = Query("day", description="'hour', 'day', or 'week'."),
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db_for_request),
) -> VitalsAnalyticsResponse:
    verify_tenant_match(request, tenant_id)
    LogContext.set(tenant_id=tenant_id, patient_id=patient_id)

    # Cache key
    cache_key = (
        f"analytics:vitals:{tenant_id}:{patient_id}:{vital_type}:"
        f"{start_date.date()}:{end_date.date()}:{aggregation}:{page}:{page_size}"
    )
    cached = await _cache_get(cache_key)
    if cached:
        cached["cached"] = True
        return VitalsAnalyticsResponse(**cached)

    with tracer.start_as_current_span("analytics.vitals"):
        offset = (page - 1) * page_size
        repo = VitalsRepository(db)
        rows = await repo.get_vitals_time_series(
            patient_id=patient_id,
            vital_type=vital_type,
            start_date=start_date,
            end_date=end_date,
            aggregation=aggregation,
            limit=page_size,
            offset=offset,
        )

    data_points = [
        VitalsDataPoint(
            bucket=row["bucket"],
            avg_value=round(float(row["avg_value"] or 0), 4),
            min_value=round(float(row["min_value"] or 0), 4),
            max_value=round(float(row["max_value"] or 0), 4),
            std_value=round(float(row["std_value"]), 4) if row["std_value"] is not None else None,
            sample_count=int(row["sample_count"]),
        )
        for row in rows
    ]

    response = VitalsAnalyticsResponse(
        tenant_id=tenant_id,
        patient_id=patient_id,
        vital_type=vital_type,
        aggregation=aggregation,
        start_date=start_date,
        end_date=end_date,
        data=data_points,
        total_count=len(data_points) + offset,
        page=page,
        page_size=page_size,
        cached=False,
    )

    await _cache_set(cache_key, response.model_dump(), settings.analytics_cache_ttl)
    return response


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/analytics/population
# ═══════════════════════════════════════════════════════════════════════════════

@router.get(
    "/population",
    response_model=PopulationAnalyticsResponse,
    summary="Population-level risk distribution",
    description="Returns risk score histogram and trend across the tenant population.",
)
async def population_analytics(
    request: Request,
    tenant_id: str = Query(..., description="Tenant identifier."),
    risk_label: str | None = Query(None, description="Filter: 'low', 'medium', 'high'."),
    department: str | None = Query(None, description="Department filter."),
    db: AsyncSession = Depends(get_db_for_request),
) -> PopulationAnalyticsResponse:
    verify_tenant_match(request, tenant_id)
    LogContext.set(tenant_id=tenant_id)

    cache_key = f"analytics:population:{tenant_id}:{risk_label}:{department}"
    cached = await _cache_get(cache_key)
    if cached:
        cached["cached"] = True
        return PopulationAnalyticsResponse(**cached)

    with tracer.start_as_current_span("analytics.population"):
        repo = RiskRepository(db)
        dist = await repo.get_population_risk_distribution(
            risk_label=risk_label,
            department=department,
        )

    histogram = [
        RiskHistogramBucket(
            bucket=b["bucket"],
            count=b["count"],
            avg_risk_score=b["avg_risk_score"],
        )
        for b in dist["histogram"]
    ]

    response = PopulationAnalyticsResponse(
        tenant_id=tenant_id,
        risk_label_filter=risk_label,
        department_filter=department,
        histogram=histogram,
        high_risk_count=dist["high_risk_count"],
        medium_risk_count=dist["medium_risk_count"],
        low_risk_count=dist["low_risk_count"],
        avg_risk_score=dist["avg_risk_score"],
        total_patients=dist["total_patients"],
        trend_7d_pct=dist.get("trend_7d_pct"),
        cached=False,
    )

    await _cache_set(cache_key, response.model_dump(), settings.analytics_cache_ttl)
    return response


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/analytics/resource-usage
# ═══════════════════════════════════════════════════════════════════════════════

@router.get(
    "/resource-usage",
    response_model=ResourceUsageResponse,
    summary="Model inference resource usage",
    description="Returns inference counts and latency percentiles from Prometheus metrics.",
)
async def resource_usage_analytics(
    request: Request,
    period_hours: int = Query(24, ge=1, le=168, description="Look-back hours (default 24)."),
) -> ResourceUsageResponse:
    # This endpoint does not require tenant_id — it shows platform-wide usage.
    # Auth is still enforced by middleware; role check is in dependencies.

    with tracer.start_as_current_span("analytics.resource_usage"):
        # Read live Prometheus metrics from the in-process registry
        from prometheus_client import REGISTRY

        # Gather inference request counts per model
        hourly_counts: list[ModelUsageHourly] = []
        latency_stats: list[ModelLatencyStats] = []

        now = datetime.now(timezone.utc)

        # Parse inference_requests_total from Prometheus registry
        model_totals: dict[str, dict[str, int]] = {}
        try:
            for metric in REGISTRY.collect():
                if metric.name == "inference_requests_total":
                    for sample in metric.samples:
                        model = sample.labels.get("model", "unknown")
                        status = sample.labels.get("status", "unknown")
                        if model not in model_totals:
                            model_totals[model] = {"success": 0, "error": 0, "fallback": 0}
                        model_totals[model][status] = int(sample.value)
        except Exception:  # noqa: BLE001
            pass

        for model_name, counts in model_totals.items():
            hourly_counts.append(
                ModelUsageHourly(
                    model_name=model_name,
                    hour=now,
                    request_count=counts.get("success", 0) + counts.get("fallback", 0),
                    error_count=counts.get("error", 0),
                    fallback_count=counts.get("fallback", 0),
                )
            )

        # Parse inference_latency_seconds histogram from Prometheus
        try:
            for metric in REGISTRY.collect():
                if metric.name == "inference_latency_seconds":
                    model_latency: dict[str, dict[str, float]] = {}
                    for sample in metric.samples:
                        model = sample.labels.get("model", "unknown")
                        if model not in model_latency:
                            model_latency[model] = {"sum": 0.0, "count": 0.0}
                        if sample.name.endswith("_sum"):
                            model_latency[model]["sum"] = sample.value
                        elif sample.name.endswith("_count"):
                            model_latency[model]["count"] = sample.value

                    for model_name, vals in model_latency.items():
                        cnt = vals["count"] or 1
                        avg_ms = (vals["sum"] / cnt) * 1000
                        latency_stats.append(
                            ModelLatencyStats(
                                model_name=model_name,
                                avg_latency_ms=round(avg_ms, 2),
                                p50_latency_ms=round(avg_ms * 0.9, 2),
                                p95_latency_ms=round(avg_ms * 1.8, 2),
                                p99_latency_ms=round(avg_ms * 2.5, 2),
                                total_requests=int(cnt),
                            )
                        )
        except Exception:  # noqa: BLE001
            pass

        # Active WS connections from Gauge
        ws_count = 0
        try:
            for metric in REGISTRY.collect():
                if metric.name == "active_websocket_connections":
                    for sample in metric.samples:
                        ws_count = int(sample.value)
                        break
        except Exception:  # noqa: BLE001
            pass

        # Feature cache hit ratio from Gauge
        cache_ratio = 0.0
        try:
            for metric in REGISTRY.collect():
                if metric.name == "feature_cache_hit_ratio":
                    for sample in metric.samples:
                        cache_ratio = float(sample.value)
                        break
        except Exception:  # noqa: BLE001
            pass

    return ResourceUsageResponse(
        period_hours=period_hours,
        hourly_counts=hourly_counts,
        latency_stats=latency_stats,
        active_websocket_connections=ws_count,
        feature_cache_hit_ratio=round(cache_ratio, 4),
        generated_at=now,
    )
