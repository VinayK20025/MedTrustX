"""
app/services/explainability.py
================================
SHAP-based model explainability service for the MedTrustX AI Platform.

Computes SHAP values using KernelExplainer (model-agnostic), builds
waterfall chart data, and caches results in Redis.
"""

from __future__ import annotations

import asyncio
import functools
import json
from datetime import datetime, timezone
from typing import Any

import numpy as np

from app.config import settings
from app.models.governance import ExplainResponse, WaterfallEntry
from app.observability.logging import get_logger

logger = get_logger(__name__)

_BACKGROUND_FEATURE_VALUES: list[list[float]] = [
    [72.0, 8.0,  120.0, 80.0,  98.0, 24.5, 10.0, 2.0, 1.0, 2.0, 0.4],
    [80.0, 10.0, 130.0, 85.0,  97.0, 26.0, 8.0,  3.0, 2.0, 3.0, 0.5],
    [65.0, 6.0,  115.0, 75.0,  99.0, 22.0, 15.0, 1.0, 0.0, 1.0, 0.3],
    [90.0, 12.0, 145.0, 90.0,  96.0, 29.0, 5.0,  5.0, 4.0, 5.0, 0.7],
    [75.0, 9.0,  125.0, 82.0,  97.5, 25.0, 12.0, 2.0, 1.5, 2.0, 0.45],
]

_FEATURE_NAMES: list[str] = [
    "avg_hr", "std_hr", "avg_bp_sys", "avg_bp_dia", "avg_spo2",
    "avg_bmi", "num_vitals_recorded", "num_conditions",
    "comorbidity_score", "num_encounters_90d", "age_factor",
]


def _compute_shap_values_sync(
    feature_vector: list[float],
    predict_fn: Any,
) -> tuple[list[float], float]:
    """CPU-bound SHAP computation — must be called via run_in_executor."""
    import shap  # type: ignore[import]

    background = np.array(_BACKGROUND_FEATURE_VALUES, dtype=np.float64)
    instance = np.array([feature_vector], dtype=np.float64)

    explainer = shap.KernelExplainer(predict_fn, background, link="identity", silent=True)
    shap_values = explainer.shap_values(instance, nsamples=50, silent=True)

    if isinstance(shap_values, list):
        values = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
    else:
        values = shap_values[0]

    base_value = float(explainer.expected_value)
    if isinstance(explainer.expected_value, (list, np.ndarray)):
        base_value = float(explainer.expected_value[-1])

    return [float(v) for v in values], base_value


def _build_waterfall(
    feature_names: list[str],
    feature_values: list[float],
    shap_values: list[float],
    base_value: float,
) -> list[WaterfallEntry]:
    indexed = sorted(
        zip(feature_names, feature_values, shap_values),
        key=lambda x: abs(x[2]),
        reverse=True,
    )
    entries: list[WaterfallEntry] = []
    cumulative = base_value
    for feat_name, feat_val, shap_val in indexed:
        cumulative += shap_val
        entries.append(WaterfallEntry(
            feature=feat_name,
            value=round(float(feat_val), 4),
            shap_value=round(float(shap_val), 6),
            cumulative=round(cumulative, 6),
            direction="positive" if shap_val >= 0 else "negative",
        ))
    return entries


def _explain_cache_key(tenant_id: str, patient_id: str, model_name: str) -> str:
    return f"explain:{tenant_id}:{patient_id}:{model_name}"


async def compute_shap_explanation(
    patient_id: str,
    tenant_id: str,
    model_name: str,
    feature_vector: dict[str, float],
    prediction_score: float,
) -> ExplainResponse:
    """
    Compute full SHAP explanation for a patient's prediction.

    Caches result in Redis. Falls back to uniform attribution on SHAP failure.
    """
    import redis.asyncio as aioredis

    cache_key = _explain_cache_key(tenant_id, patient_id, model_name)

    # Cache look-up
    redis_client: aioredis.Redis | None = None
    try:
        redis_client = await aioredis.from_url(
            settings.redis_url, encoding="utf-8", decode_responses=True,
            socket_connect_timeout=2, socket_timeout=2,
        )
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return ExplainResponse(**data)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Redis unavailable for explanation cache", extra={"error": str(exc)})
    finally:
        if redis_client:
            await redis_client.aclose()

    ordered_values: list[float] = [
        float(feature_vector.get(name, 0.0)) for name in _FEATURE_NAMES
    ]

    from app.services.tf_serving import predict_readmission

    def _sync_predict(X: np.ndarray) -> np.ndarray:
        loop = asyncio.new_event_loop()
        try:
            results = []
            for row in X:
                feat = {name: float(val) for name, val in zip(_FEATURE_NAMES, row)}
                score, _ = loop.run_until_complete(predict_readmission(feat, model_name))
                results.append(score)
            return np.array(results, dtype=np.float64)
        finally:
            loop.close()

    loop = asyncio.get_running_loop()
    try:
        shap_values, base_value = await loop.run_in_executor(
            None,
            functools.partial(_compute_shap_values_sync, ordered_values, _sync_predict),
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning("SHAP computation failed — uniform approximation", extra={"error": str(exc)})
        base_value = prediction_score / 2.0
        delta = prediction_score - base_value
        n = len(_FEATURE_NAMES)
        shap_values = [delta / n] * n

    shap_dict = {name: val for name, val in zip(_FEATURE_NAMES, shap_values)}
    feature_values_dict = {name: float(feature_vector.get(name, 0.0)) for name in _FEATURE_NAMES}
    waterfall = _build_waterfall(_FEATURE_NAMES, ordered_values, shap_values, base_value)
    predicted_value = base_value + sum(shap_values)

    response = ExplainResponse(
        patient_id=patient_id,
        model_name=model_name,
        tenant_id=tenant_id,
        shap_values=shap_dict,
        feature_names=_FEATURE_NAMES,
        feature_values=feature_values_dict,
        base_value=round(base_value, 6),
        predicted_value=round(min(max(predicted_value, 0.0), 1.0), 6),
        waterfall_data=waterfall,
        explained_at=datetime.now(timezone.utc),
    )

    redis_client = None
    try:
        redis_client = await aioredis.from_url(
            settings.redis_url, encoding="utf-8", decode_responses=True,
            socket_connect_timeout=2, socket_timeout=2,
        )
        await redis_client.set(cache_key, response.model_dump_json(), ex=settings.feature_cache_ttl)
    except Exception:  # noqa: BLE001
        pass
    finally:
        if redis_client:
            await redis_client.aclose()

    return response


def get_top_shap_features(
    shap_values: dict[str, float],
    feature_values: dict[str, float],
    n: int = 3,
) -> list[dict[str, Any]]:
    """Return the top N features by |SHAP value|."""
    sorted_features = sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True)[:n]
    return [
        {
            "feature": feat,
            "shap_value": round(val, 6),
            "value": round(float(feature_values.get(feat, 0.0)), 4),
        }
        for feat, val in sorted_features
    ]
