"""
app/observability/metrics.py
============================
Prometheus metrics definitions for the MedTrustX AI Platform Service.

All metrics are module-level singletons registered with the default
``CollectorRegistry``.  The ``/metrics`` HTTP endpoint is served by the
Prometheus ASGI middleware added in ``app/main.py``.

Defined metrics
───────────────
  inference_requests_total        Counter    (model, tenant, status)
  inference_latency_seconds       Histogram  (model)
  active_websocket_connections    Gauge      ()
  model_drift_detected            Counter    (model, feature)
  feature_cache_hit_ratio         Gauge      ()
  feature_cache_requests_total    Counter    (result: hit|miss)
  db_query_duration_seconds       Histogram  (repository, operation)
  tf_serving_requests_total       Counter    (model, status)
  tf_serving_latency_seconds      Histogram  (model)
  mlflow_requests_total           Counter    (operation, status)
  anomaly_detections_total        Counter    (tenant, severity, vital_type)

Usage::

    from app.observability.metrics import (
        INFERENCE_REQUESTS,
        INFERENCE_LATENCY,
        record_inference,
    )

    with INFERENCE_LATENCY.labels(model="readmission").time():
        result = await run_inference(...)

    record_inference(model="readmission", tenant="tenant_apollo", status="success")
"""

from __future__ import annotations

import time
from contextlib import contextmanager
from typing import Generator

from prometheus_client import (
    Counter,
    Gauge,
    Histogram,
    Info,
    REGISTRY,
    CollectorRegistry,
)

# ─── Service info (static labels) ─────────────────────────────────────────────
SERVICE_INFO = Info(
    "medtrust_ai_platform",
    "MedTrustX AI Platform Service metadata",
)

# ─── Inference metrics ─────────────────────────────────────────────────────────
INFERENCE_REQUESTS = Counter(
    "inference_requests_total",
    "Total number of ML inference requests",
    labelnames=["model", "tenant", "status"],
)

INFERENCE_LATENCY = Histogram(
    "inference_latency_seconds",
    "End-to-end inference request duration in seconds",
    labelnames=["model"],
    buckets=[0.05, 0.1, 0.25, 0.5, 0.75, 1.0, 2.0, 3.0, 5.0, 10.0],
)

# ─── WebSocket metrics ─────────────────────────────────────────────────────────
ACTIVE_WEBSOCKET_CONNECTIONS = Gauge(
    "active_websocket_connections",
    "Current number of active WebSocket client connections",
)

# ─── Drift detection metrics ───────────────────────────────────────────────────
MODEL_DRIFT_DETECTED = Counter(
    "model_drift_detected",
    "Number of feature drift events detected",
    labelnames=["model", "feature"],
)

# ─── Cache metrics ─────────────────────────────────────────────────────────────
FEATURE_CACHE_HIT_RATIO = Gauge(
    "feature_cache_hit_ratio",
    "Rolling ratio of feature vector cache hits (0.0 – 1.0)",
)

FEATURE_CACHE_REQUESTS = Counter(
    "feature_cache_requests_total",
    "Total feature cache requests",
    labelnames=["result"],  # "hit" or "miss"
)

# ─── Database metrics ──────────────────────────────────────────────────────────
DB_QUERY_DURATION = Histogram(
    "db_query_duration_seconds",
    "PostgreSQL async query duration in seconds",
    labelnames=["repository", "operation"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
)

# ─── TF Serving metrics ────────────────────────────────────────────────────────
TF_SERVING_REQUESTS = Counter(
    "tf_serving_requests_total",
    "Total requests sent to TensorFlow Serving",
    labelnames=["model", "status"],  # status: success | timeout | error | fallback
)

TF_SERVING_LATENCY = Histogram(
    "tf_serving_latency_seconds",
    "TensorFlow Serving REST API response latency",
    labelnames=["model"],
    buckets=[0.05, 0.1, 0.2, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0],
)

# ─── MLflow metrics ────────────────────────────────────────────────────────────
MLFLOW_REQUESTS = Counter(
    "mlflow_requests_total",
    "Total requests to the MLflow model registry",
    labelnames=["operation", "status"],
)

# ─── Anomaly detection metrics ─────────────────────────────────────────────────
ANOMALY_DETECTIONS = Counter(
    "anomaly_detections_total",
    "Total anomaly events detected in patient vitals",
    labelnames=["tenant", "severity", "vital_type"],
)

# ─── Auth metrics ──────────────────────────────────────────────────────────────
AUTH_REQUESTS = Counter(
    "auth_requests_total",
    "Total authentication/authorisation checks",
    labelnames=["result"],  # success | invalid_token | expired | forbidden | pqc_failed
)

JWKS_CACHE_REFRESHES = Counter(
    "jwks_cache_refreshes_total",
    "Total JWKS cache refresh operations from Keycloak",
    labelnames=["status"],  # success | error
)


# ─── Helper functions ──────────────────────────────────────────────────────────
def record_inference(
    model: str,
    tenant: str,
    status: str,
) -> None:
    """
    Increment the inference request counter.

    Args:
        model:  ML model name (e.g. "readmission").
        tenant: Tenant identifier (e.g. "tenant_apollo").
        status: One of "success", "fallback", "error".
    """
    INFERENCE_REQUESTS.labels(model=model, tenant=tenant, status=status).inc()


def record_cache_result(hit: bool) -> None:
    """
    Record a feature cache hit or miss and update the rolling hit-ratio gauge.

    The hit ratio is approximated as a simple exponential moving average
    (EMA) on the gauge value, with alpha=0.1 to smooth short-term noise.

    Args:
        hit: True when the cache key was found; False on a miss.
    """
    result = "hit" if hit else "miss"
    FEATURE_CACHE_REQUESTS.labels(result=result).inc()

    # Compute EMA of hit ratio from raw counter totals
    total_hits = _safe_counter_value(FEATURE_CACHE_REQUESTS.labels(result="hit"))
    total_misses = _safe_counter_value(FEATURE_CACHE_REQUESTS.labels(result="miss"))
    total = total_hits + total_misses
    if total > 0:
        FEATURE_CACHE_HIT_RATIO.set(total_hits / total)


def record_drift(model: str, feature: str) -> None:
    """
    Increment the drift-detected counter for a specific model/feature pair.

    Args:
        model:   ML model name.
        feature: Feature column name that drifted.
    """
    MODEL_DRIFT_DETECTED.labels(model=model, feature=feature).inc()


def record_anomaly(tenant: str, severity: str, vital_type: str) -> None:
    """
    Increment the anomaly detection counter.

    Args:
        tenant:     Tenant identifier.
        severity:   One of "low", "medium", "critical".
        vital_type: Vital type string (e.g. "Heart rate").
    """
    ANOMALY_DETECTIONS.labels(
        tenant=tenant, severity=severity, vital_type=vital_type
    ).inc()


@contextmanager
def time_db_query(repository: str, operation: str) -> Generator[None, None, None]:
    """
    Context manager that records the duration of a DB query.

    Args:
        repository: Name of the repository class (e.g. "vitals").
        operation:  Operation name (e.g. "get_patient_vitals").

    Example::

        async with time_db_query("vitals", "get_patient_vitals"):
            rows = await session.execute(stmt)
    """
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        DB_QUERY_DURATION.labels(
            repository=repository, operation=operation
        ).observe(elapsed)


def initialise_service_info(service_name: str, version: str, environment: str) -> None:
    """
    Set the static service Info metric labels.

    Called once during application startup so Prometheus scrapes always
    include service identity metadata.

    Args:
        service_name: Service name string.
        version:      Semantic version string.
        environment:  Deployment environment (development/staging/production).
    """
    SERVICE_INFO.info(
        {
            "name": service_name,
            "version": version,
            "environment": environment,
        }
    )


# ─── Internal helpers ──────────────────────────────────────────────────────────
def _safe_counter_value(counter_child: object) -> float:
    """Extract current value from a prometheus_client counter child safely."""
    try:
        return counter_child._value.get()  # type: ignore[attr-defined]
    except Exception:  # noqa: BLE001
        return 0.0
