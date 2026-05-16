"""
app/services/tf_serving.py
===========================
TensorFlow Serving REST client for the MedTrustX AI Platform Service.

Responsibilities:
  - Send prediction requests to TF Serving REST API with a hard 3-second timeout.
  - Return structured prediction results.
  - Fall back to rule-based scoring when TF Serving is unavailable (timeout,
    connection refused, non-2xx response).
  - Record Prometheus metrics for every TF Serving call.
  - Emit OpenTelemetry spans for each inference request.

TF Serving REST API format (v1):
  POST http://tf-serving:8501/v1/models/{model_name}:predict
  Body: { "instances": [[f1, f2, ...]] }
  Response: { "predictions": [[score]] }
"""

from __future__ import annotations

import time
from typing import Any

import httpx

from app.config import settings
from app.observability.logging import get_logger
from app.observability.metrics import (
    TF_SERVING_LATENCY,
    TF_SERVING_REQUESTS,
)
from app.observability.tracing import get_tracer, set_span_attributes

logger = get_logger(__name__)
tracer = get_tracer(__name__)


# ─── Rule-based fallback scorers ──────────────────────────────────────────────

def _rule_based_readmission_score(features: dict[str, float]) -> float:
    """
    Compute a rule-based readmission risk score when TF Serving is unavailable.

    Formula (from specification):
        score = num_conditions * 0.4 + age_factor * 0.3 + vitals_factor * 0.3

    vitals_factor is derived from:
      - Abnormal SpO2 (< 95): +0.3
      - Elevated HR (> 100):  +0.2
      - High BP_sys (> 140):  +0.2
      - Otherwise:             0.0

    Returns:
        Float score clamped to [0.0, 1.0].
    """
    num_conditions: float = min(features.get("num_conditions", 0.0), 10.0)
    age_factor: float = min(max(features.get("age_factor", 0.5), 0.0), 1.0)

    # Vitals factor (0.0 – 1.0)
    vitals_factor = 0.0
    spo2 = features.get("avg_spo2", 98.0)
    hr = features.get("avg_hr", 72.0)
    bp_sys = features.get("avg_bp_sys", 120.0)
    if spo2 > 0 and spo2 < 95.0:
        vitals_factor += 0.3
    if hr > 100.0:
        vitals_factor += 0.2
    if bp_sys > 140.0:
        vitals_factor += 0.2
    vitals_factor = min(vitals_factor, 1.0)

    # Condition factor (num_conditions / 10, max 1.0)
    condition_factor = num_conditions / 10.0

    raw_score = (
        condition_factor * 0.4
        + age_factor * 0.3
        + vitals_factor * 0.3
    )
    return round(min(max(raw_score, 0.0), 1.0), 4)


def _rule_based_anomaly_score(vital_values: dict[str, list[float]]) -> float:
    """
    Rough anomaly score based on clinical thresholds — TF Serving fallback.

    Returns:
        Float 0.0 – 1.0.
    """
    anomaly_count = 0
    total = 0
    thresholds = {
        "hr": (40.0, 150.0),
        "spo2": (90.0, 100.0),
        "bp_sys": (70.0, 200.0),
        "bp_dia": (40.0, 130.0),
    }
    for field, values in vital_values.items():
        if field in thresholds:
            low, high = thresholds[field]
            for v in values:
                total += 1
                if v < low or v > high:
                    anomaly_count += 1

    return round(anomaly_count / max(total, 1), 4)


# ─── TF Serving client ─────────────────────────────────────────────────────────

async def call_tf_serving(
    model_name: str,
    instances: list[list[float]],
) -> tuple[list[float], str]:
    """
    Send a prediction request to TF Serving REST API.

    Args:
        model_name: TF Serving model name (e.g. "readmission").
        instances:  Feature matrix — list of feature vectors.

    Returns:
        Tuple of (predictions_list, source) where source is "tf_serving".

    Raises:
        TFServingUnavailableError: On timeout, connection error, or non-2xx.
    """
    url = settings.tf_serving_predict_url.format(model_name=model_name)
    payload = {"instances": instances}

    with tracer.start_as_current_span(f"tf_serving.predict.{model_name}") as span:
        set_span_attributes(span, model_name=model_name)
        start = time.perf_counter()

        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(settings.tf_serving_timeout)
            ) as client:
                response = await client.post(url, json=payload)

            elapsed = time.perf_counter() - start
            TF_SERVING_LATENCY.labels(model=model_name).observe(elapsed)

            response.raise_for_status()
            data = response.json()

            predictions = data.get("predictions", [])
            if not predictions:
                raise ValueError(
                    f"TF Serving returned empty predictions for model={model_name!r}"
                )

            TF_SERVING_REQUESTS.labels(model=model_name, status="success").inc()
            span.set_attribute("tf_serving.latency_ms", round(elapsed * 1000, 2))
            span.set_attribute("tf_serving.status", "success")

            logger.info(
                "TF Serving prediction successful",
                extra={
                    "model": model_name,
                    "latency_ms": round(elapsed * 1000, 2),
                    "num_instances": len(instances),
                },
            )

            # Flatten single-element inner lists: [[0.73]] → [0.73]
            flat: list[float] = []
            for pred in predictions:
                if isinstance(pred, list):
                    flat.extend(float(p) for p in pred)
                else:
                    flat.append(float(pred))

            return flat, "tf_serving"

        except httpx.TimeoutException as exc:
            elapsed = time.perf_counter() - start
            TF_SERVING_LATENCY.labels(model=model_name).observe(elapsed)
            TF_SERVING_REQUESTS.labels(model=model_name, status="timeout").inc()
            span.set_attribute("tf_serving.status", "timeout")
            logger.warning(
                "TF Serving timeout — switching to rule-based fallback",
                extra={"model": model_name, "timeout": settings.tf_serving_timeout},
            )
            raise TFServingUnavailableError(
                f"TF Serving timed out after {settings.tf_serving_timeout}s"
            ) from exc

        except httpx.RequestError as exc:
            TF_SERVING_REQUESTS.labels(model=model_name, status="error").inc()
            span.set_attribute("tf_serving.status", "connection_error")
            logger.warning(
                "TF Serving connection error — switching to rule-based fallback",
                extra={"model": model_name, "error": str(exc)},
            )
            raise TFServingUnavailableError(
                f"TF Serving unreachable: {exc}"
            ) from exc

        except httpx.HTTPStatusError as exc:
            TF_SERVING_REQUESTS.labels(model=model_name, status="error").inc()
            span.set_attribute("tf_serving.status", f"http_{exc.response.status_code}")
            logger.warning(
                "TF Serving returned error status",
                extra={
                    "model": model_name,
                    "status_code": exc.response.status_code,
                },
            )
            raise TFServingUnavailableError(
                f"TF Serving HTTP {exc.response.status_code}: {exc.response.text[:200]}"
            ) from exc


class TFServingUnavailableError(Exception):
    """Raised when TF Serving is unreachable, times out, or returns an error."""


# ─── High-level inference functions with fallback ─────────────────────────────

async def predict_readmission(
    features: dict[str, float],
    model_name: str | None = None,
) -> tuple[float, str]:
    """
    Predict readmission risk for a single patient.

    Attempts TF Serving first; falls back to rule-based scoring on failure.

    Args:
        features:   Feature dict (from FeatureVector.to_dict_for_shap()).
        model_name: TF model name override (default: settings.tf_model_readmission).

    Returns:
        Tuple of (risk_score: float, source: str).
        source is "tf_serving" or "rule_based".
    """
    model = model_name or settings.tf_model_readmission
    instances = [[
        features.get("avg_hr", 0.0),
        features.get("std_hr", 0.0),
        features.get("avg_bp_sys", 0.0),
        features.get("avg_bp_dia", 0.0),
        features.get("avg_spo2", 0.0),
        features.get("avg_bmi", 0.0),
        features.get("num_vitals_recorded", 0.0),
        features.get("num_conditions", 0.0),
        features.get("comorbidity_score", 0.0),
        features.get("num_encounters_90d", 0.0),
        features.get("age_factor", 0.5),
    ]]

    try:
        predictions, source = await call_tf_serving(model, instances)
        score = float(predictions[0])
        score = min(max(score, 0.0), 1.0)
        return score, source
    except TFServingUnavailableError:
        TF_SERVING_REQUESTS.labels(model=model, status="fallback").inc()
        score = _rule_based_readmission_score(features)
        logger.info(
            "Rule-based readmission fallback used",
            extra={"score": score, "model": model},
        )
        return score, "rule_based"


async def detect_vitals_anomaly(
    vitals_matrix: list[list[float]],
    model_name: str | None = None,
) -> tuple[float, str]:
    """
    Run deep anomaly detection on a vitals matrix via TF Serving.

    Args:
        vitals_matrix: List of feature vectors (one per vital reading).
        model_name:    TF model name override.

    Returns:
        Tuple of (anomaly_score: float, source: str).
    """
    model = model_name or settings.tf_model_anomaly
    try:
        predictions, source = await call_tf_serving(model, vitals_matrix)
        # Aggregate: max anomaly score across all readings
        score = float(max(predictions)) if predictions else 0.0
        return min(max(score, 0.0), 1.0), source
    except TFServingUnavailableError:
        TF_SERVING_REQUESTS.labels(model=model, status="fallback").inc()
        return 0.0, "rule_based"
