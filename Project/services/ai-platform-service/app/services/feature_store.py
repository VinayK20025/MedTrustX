"""
app/services/feature_store.py
==============================
Feature engineering service for the MedTrustX AI Platform.

Responsibilities:
  - Compute the ``FeatureVector`` Pydantic model for a patient by querying
    ``patient_vitals`` (last 90 days) and ``patient_conditions`` (active).
  - Cache the result in Redis with key ``features:{tenant_id}:{patient_id}``
    and TTL of 15 minutes (FEATURE_CACHE_TTL).
  - Record cache hit/miss metrics for the feature_cache_hit_ratio gauge.

Feature vector contents:
  - avg_hr, std_hr             — heart rate statistics
  - avg_bp_sys, avg_bp_dia    — blood pressure averages
  - avg_spo2                   — SpO2 average
  - avg_bmi                    — BMI average (if recorded)
  - num_vitals_recorded        — total vital readings in window
  - num_conditions             — count of active conditions
  - comorbidity_score          — Charlson Comorbidity Index
  - num_encounters_90d         — distinct encounter count
  - age_factor                 — derived from patient context (defaults to 0.5)
"""

from __future__ import annotations

import json
import math
import statistics
from typing import Any

import redis.asyncio as aioredis
from pydantic import BaseModel, ConfigDict, Field

from app.config import settings
from app.db.repositories.conditions import ConditionsRepository
from app.db.repositories.vitals import VitalsRepository
from app.observability.logging import get_logger
from app.observability.metrics import record_cache_result

logger = get_logger(__name__)


# ─── Feature vector model ──────────────────────────────────────────────────────
class FeatureVector(BaseModel):
    """
    Typed feature vector passed to TF Serving and used for SHAP explanations.
    All float fields default to 0.0 so the model always receives a complete input.
    """

    model_config = ConfigDict(strict=True)

    patient_id: str
    tenant_id: str

    # Vitals-derived features
    avg_hr: float = Field(default=0.0, description="Mean heart rate (bpm).")
    std_hr: float = Field(default=0.0, description="Std dev of heart rate.")
    avg_bp_sys: float = Field(default=0.0, description="Mean systolic BP (mmHg).")
    avg_bp_dia: float = Field(default=0.0, description="Mean diastolic BP (mmHg).")
    avg_spo2: float = Field(default=0.0, description="Mean SpO2 (%).")
    avg_bmi: float = Field(default=0.0, description="Mean BMI (kg/m²).")
    num_vitals_recorded: int = Field(
        default=0, description="Total vital readings in the lookback window."
    )

    # Condition-derived features
    num_conditions: int = Field(
        default=0, description="Count of active conditions."
    )
    comorbidity_score: float = Field(
        default=0.0, description="Charlson Comorbidity Index."
    )

    # Encounter feature
    num_encounters_90d: int = Field(
        default=0, description="Distinct encounters in last 90 days."
    )

    # Age-derived risk factor (0.0 – 1.0, normalised)
    age_factor: float = Field(
        default=0.5, description="Age-derived risk factor (0.0 youngest, 1.0 oldest)."
    )

    def to_tf_instances(self) -> list[list[float]]:
        """
        Serialise the feature vector to TF Serving instances format.

        TF Serving REST API expects:
          { "instances": [[f1, f2, f3, ...]] }

        Returns:
            A single-item list of float lists for the TF Serving payload.
        """
        return [[
            self.avg_hr,
            self.std_hr,
            self.avg_bp_sys,
            self.avg_bp_dia,
            self.avg_spo2,
            self.avg_bmi,
            float(self.num_vitals_recorded),
            float(self.num_conditions),
            self.comorbidity_score,
            float(self.num_encounters_90d),
            self.age_factor,
        ]]

    def to_dict_for_shap(self) -> dict[str, float]:
        """Return a flat float dict for use as SHAP input."""
        return {
            "avg_hr": self.avg_hr,
            "std_hr": self.std_hr,
            "avg_bp_sys": self.avg_bp_sys,
            "avg_bp_dia": self.avg_bp_dia,
            "avg_spo2": self.avg_spo2,
            "avg_bmi": self.avg_bmi,
            "num_vitals_recorded": float(self.num_vitals_recorded),
            "num_conditions": float(self.num_conditions),
            "comorbidity_score": self.comorbidity_score,
            "num_encounters_90d": float(self.num_encounters_90d),
            "age_factor": self.age_factor,
        }


# ─── Vital type → field mapping ────────────────────────────────────────────────
_VITAL_FIELD_MAP: dict[str, str] = {
    "heart rate": "hr",
    "pulse": "hr",
    "bp systolic": "bp_sys",
    "systolic": "bp_sys",
    "bp diastolic": "bp_dia",
    "diastolic": "bp_dia",
    "spo2": "spo2",
    "oxygen saturation": "spo2",
    "bmi": "bmi",
    "body mass index": "bmi",
}


def _classify_vital(vital_type: str) -> str | None:
    """Map a raw vital_type string to a feature field name."""
    vt = vital_type.lower().strip()
    for pattern, field in _VITAL_FIELD_MAP.items():
        if pattern in vt:
            return field
    return None


def _safe_mean(values: list[float]) -> float:
    return statistics.mean(values) if values else 0.0


def _safe_stdev(values: list[float]) -> float:
    return statistics.stdev(values) if len(values) >= 2 else 0.0


# ─── Redis cache helpers ───────────────────────────────────────────────────────
def _build_cache_key(tenant_id: str, patient_id: str) -> str:
    return f"features:{tenant_id}:{patient_id}"


async def _get_redis() -> aioredis.Redis:
    """Create a new Redis connection (caller responsible for closing)."""
    return await aioredis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
        socket_connect_timeout=2,
        socket_timeout=2,
    )


# ─── Main compute function ─────────────────────────────────────────────────────
async def compute_readmission_features(
    patient_id: str,
    tenant_id: str,
    vitals_repo: VitalsRepository,
    conditions_repo: ConditionsRepository,
) -> FeatureVector:
    """
    Compute the full feature vector for readmission risk prediction.

    Pipeline:
      1. Check Redis cache — return cached vector if present.
      2. Query patient_vitals for the last 90 days (via vitals_repo).
      3. Compute per-vital-type statistics (mean, std).
      4. Query patient_conditions (via conditions_repo) for active conditions
         count and Charlson Comorbidity Index.
      5. Count distinct encounters in the last 90 days.
      6. Build FeatureVector, serialise to JSON, cache in Redis (TTL 15 min).
      7. Return typed FeatureVector.

    Args:
        patient_id:      Patient UUID string.
        tenant_id:       Validated tenant identifier.
        vitals_repo:     VitalsRepository bound to a tenant-isolated session.
        conditions_repo: ConditionsRepository bound to the same session.

    Returns:
        A fully populated ``FeatureVector`` instance.
    """
    cache_key = _build_cache_key(tenant_id, patient_id)

    # ── 1. Cache look-up ───────────────────────────────────────────────────
    redis_client: aioredis.Redis | None = None
    try:
        redis_client = await _get_redis()
        cached = await redis_client.get(cache_key)
        if cached:
            record_cache_result(hit=True)
            logger.debug(
                "Feature cache HIT",
                extra={"patient_id": patient_id, "cache_key": cache_key},
            )
            data = json.loads(cached)
            return FeatureVector(**data)
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Redis cache unavailable — computing features from DB",
            extra={"error": str(exc)},
        )
    finally:
        if redis_client:
            await redis_client.aclose()

    record_cache_result(hit=False)
    logger.debug(
        "Feature cache MISS — querying DB",
        extra={"patient_id": patient_id},
    )

    # ── 2. Fetch vitals (last 90 days) ─────────────────────────────────────
    vitals_rows = await vitals_repo.get_patient_vitals(
        patient_id=patient_id,
        lookback_days=settings.readmission_lookback_days,
    )

    # ── 3. Compute per-vital statistics ────────────────────────────────────
    buckets: dict[str, list[float]] = {
        "hr": [], "bp_sys": [], "bp_dia": [], "spo2": [], "bmi": []
    }
    for row in vitals_rows:
        field = _classify_vital(row["vital_type"])
        if field and field in buckets and row["value"] is not None:
            val = float(row["value"])
            if not math.isnan(val) and not math.isinf(val):
                buckets[field].append(val)

    avg_hr = _safe_mean(buckets["hr"])
    std_hr = _safe_stdev(buckets["hr"])
    avg_bp_sys = _safe_mean(buckets["bp_sys"])
    avg_bp_dia = _safe_mean(buckets["bp_dia"])
    avg_spo2 = _safe_mean(buckets["spo2"])
    avg_bmi = _safe_mean(buckets["bmi"])

    # ── 4. Conditions and Charlson score ───────────────────────────────────
    num_conditions = await conditions_repo.count_active_conditions(patient_id)
    comorbidity_score = await conditions_repo.get_comorbidity_score(patient_id)

    # ── 5. Encounter count ─────────────────────────────────────────────────
    num_encounters_90d = await vitals_repo.count_encounters(
        patient_id=patient_id,
        lookback_days=settings.readmission_lookback_days,
    )

    # ── 6. Build feature vector ────────────────────────────────────────────
    vector = FeatureVector(
        patient_id=patient_id,
        tenant_id=tenant_id,
        avg_hr=round(avg_hr, 4),
        std_hr=round(std_hr, 4),
        avg_bp_sys=round(avg_bp_sys, 4),
        avg_bp_dia=round(avg_bp_dia, 4),
        avg_spo2=round(avg_spo2, 4),
        avg_bmi=round(avg_bmi, 4),
        num_vitals_recorded=len(vitals_rows),
        num_conditions=num_conditions,
        comorbidity_score=round(comorbidity_score, 4),
        num_encounters_90d=num_encounters_90d,
        age_factor=0.5,  # Default; enriched in the inference router via demographics
    )

    # ── 7. Cache the result ────────────────────────────────────────────────
    redis_client = None
    try:
        redis_client = await _get_redis()
        payload = vector.model_dump_json()
        await redis_client.set(cache_key, payload, ex=settings.feature_cache_ttl)
        logger.debug(
            "Feature vector cached",
            extra={
                "patient_id": patient_id,
                "cache_key": cache_key,
                "ttl": settings.feature_cache_ttl,
            },
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Could not cache feature vector",
            extra={"error": str(exc)},
        )
    finally:
        if redis_client:
            await redis_client.aclose()

    return vector


async def invalidate_feature_cache(tenant_id: str, patient_id: str) -> None:
    """
    Delete the cached feature vector for a patient.

    Call this when new vitals or conditions are recorded to ensure
    the next inference uses fresh data.

    Args:
        tenant_id:  Tenant identifier.
        patient_id: Patient UUID.
    """
    cache_key = _build_cache_key(tenant_id, patient_id)
    redis_client: aioredis.Redis | None = None
    try:
        redis_client = await _get_redis()
        deleted = await redis_client.delete(cache_key)
        if deleted:
            logger.info(
                "Feature cache invalidated",
                extra={"patient_id": patient_id, "cache_key": cache_key},
            )
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Cache invalidation failed",
            extra={"error": str(exc)},
        )
    finally:
        if redis_client:
            await redis_client.aclose()
