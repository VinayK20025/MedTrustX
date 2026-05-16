"""
app/routers/inference.py
=========================
ML inference endpoints for the MedTrustX AI Platform Service.

Endpoints:
  POST /api/ai/predict-readmission   — readmission risk prediction
  POST /api/ai/vitals-anomaly        — vital sign anomaly detection
  POST /api/ai/diagnose-risk         — ICD-10 comorbidity risk assessment

All endpoints:
  - Require valid PQC+JWT token (enforced by PQCAuthMiddleware)
  - Validate that request.tenant_id matches body tenant_id (403 on mismatch)
  - Emit OpenTelemetry spans
  - Record Prometheus metrics
  - Return RFC 7807 Problem Details on error
"""

from __future__ import annotations

import statistics
import time
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.conditions import ConditionsRepository
from app.db.repositories.risk import RiskRepository
from app.db.repositories.vitals import VitalsRepository
from app.dependencies import get_db_for_request, problem_detail, verify_tenant_match
from app.models.inference import (
    AnomalyEvent,
    DiagnoseRiskRequest,
    DiagnoseRiskResponse,
    FeatureImportances,
    ReadmissionPredictRequest,
    ReadmissionPredictResponse,
    RiskFactor,
    SHAPExplanation,
    VitalsAnomalyRequest,
    VitalsAnomalyResponse,
)
from app.observability.logging import LogContext, get_logger
from app.observability.metrics import (
    INFERENCE_LATENCY,
    INFERENCE_REQUESTS,
    record_anomaly,
    record_inference,
)
from app.observability.tracing import get_tracer, set_span_attributes
from app.services.explainability import compute_shap_explanation, get_top_shap_features
from app.services.feature_store import compute_readmission_features
from app.services.mlflow_client import get_latest_model_version
from app.services.tf_serving import (
    _rule_based_readmission_score,
    detect_vitals_anomaly,
    predict_readmission,
)

logger = get_logger(__name__)
tracer = get_tracer(__name__)
router = APIRouter(prefix="/api/ai", tags=["Inference"])


# ─── Helper: risk label from score ────────────────────────────────────────────

def _score_to_label(score: float) -> str:
    if score < 0.3:
        return "low"
    elif score < 0.6:
        return "medium"
    return "high"


def _severity_from_anomalies(anomalies: list[dict[str, Any]]) -> str:
    if not anomalies:
        return "low"
    max_z = max(abs(a["z_score"]) for a in anomalies)
    if max_z >= 3.5:
        return "critical"
    elif max_z >= 2.5:
        return "medium"
    return "low"


def _recommended_action(severity: str, affected: list[str]) -> str:
    if severity == "critical":
        return (
            f"URGENT: Critical anomalies detected in {', '.join(affected)}. "
            "Notify the attending clinician immediately and consider "
            "bedside assessment within 15 minutes."
        )
    elif severity == "medium":
        return (
            f"Monitor closely: Elevated readings in {', '.join(affected)}. "
            "Reassess vitals in 30 minutes and escalate if worsening."
        )
    return "Continue routine monitoring. No immediate action required."


# ═══════════════════════════════════════════════════════════════════════════════
# POST /api/ai/predict-readmission
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/predict-readmission",
    response_model=ReadmissionPredictResponse,
    summary="Predict 30-day readmission risk",
    description=(
        "Computes readmission risk for a patient using features from the last "
        "90 days of vitals and active conditions. Calls TF Serving; falls back "
        "to rule-based scoring on timeout."
    ),
    responses={
        401: {"description": "Unauthorized"},
        403: {"description": "Tenant mismatch or insufficient role"},
        422: {"description": "Validation error"},
        500: {"description": "Inference failed"},
    },
)
async def predict_readmission_endpoint(
    body: ReadmissionPredictRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_for_request),
) -> ReadmissionPredictResponse:
    """Predict readmission risk for a single patient."""

    patient_id = str(body.patient_id)
    tenant_id = body.tenant_id

    # Tenant isolation check
    verify_tenant_match(request, tenant_id)
    LogContext.set(tenant_id=tenant_id, patient_id=patient_id)

    with tracer.start_as_current_span("ai.inference.readmission") as span:
        set_span_attributes(span, tenant_id=tenant_id, patient_id=patient_id,
                            model_name="readmission")
        start = time.perf_counter()

        try:
            vitals_repo = VitalsRepository(db)
            conditions_repo = ConditionsRepository(db)
            risk_repo = RiskRepository(db)

            # ── Feature engineering ────────────────────────────────────────
            feature_vector = await compute_readmission_features(
                patient_id=patient_id,
                tenant_id=tenant_id,
                vitals_repo=vitals_repo,
                conditions_repo=conditions_repo,
            )

            # ── Model version from MLflow ───────────────────────────────────
            model_version = await get_latest_model_version("readmission")

            # ── Inference (TF Serving or fallback) ─────────────────────────
            features_dict = feature_vector.to_dict_for_shap()
            risk_score, inference_source = await predict_readmission(features_dict)
            risk_label = _score_to_label(risk_score)
            confidence = min(0.95, 0.6 + abs(risk_score - 0.5) * 0.7)

            # ── SHAP explanation ────────────────────────────────────────────
            explanation_response = await compute_shap_explanation(
                patient_id=patient_id,
                tenant_id=tenant_id,
                model_name="readmission",
                feature_vector=features_dict,
                prediction_score=risk_score,
            )

            top_features = get_top_shap_features(
                explanation_response.shap_values,
                features_dict,
                n=3,
            )

            shap_explanation = SHAPExplanation(
                base_value=explanation_response.base_value,
                top_features=top_features,
                prediction_delta=sum(v["shap_value"] for v in top_features),
            )

            # ── Feature importances (SHAP magnitudes) ─────────────────────
            sv = explanation_response.shap_values
            fi = FeatureImportances(
                avg_hr=abs(sv.get("avg_hr", 0.0)),
                avg_bp_sys=abs(sv.get("avg_bp_sys", 0.0)),
                avg_spo2=abs(sv.get("avg_spo2", 0.0)),
                num_conditions=abs(sv.get("num_conditions", 0.0)),
                comorbidity_score=abs(sv.get("comorbidity_score", 0.0)),
                num_encounters_90d=abs(sv.get("num_encounters_90d", 0.0)),
                age_factor=abs(sv.get("age_factor", 0.0)),
            )

            # ── Persist to readmission_risk table ─────────────────────────
            record_id = await risk_repo.insert_risk_record(
                patient_id=patient_id,
                tenant_id=tenant_id,
                risk_score=risk_score,
                risk_label=risk_label,
                confidence=confidence,
                model_name="readmission",
                model_version=model_version,
                feature_vector=features_dict,
                explanation=explanation_response.model_dump(),
            )

            # ── Metrics ────────────────────────────────────────────────────
            latency = time.perf_counter() - start
            INFERENCE_LATENCY.labels(model="readmission").observe(latency)
            record_inference("readmission", tenant_id, "success")
            set_span_attributes(span, latency_ms=latency * 1000)

            logger.info(
                "Readmission prediction completed",
                extra={
                    "patient_id": patient_id,
                    "risk_score": risk_score,
                    "risk_label": risk_label,
                    "inference_source": inference_source,
                    "latency_ms": round(latency * 1000, 2),
                },
            )

            return ReadmissionPredictResponse(
                patient_id=patient_id,
                tenant_id=tenant_id,
                risk_score=round(risk_score, 4),
                risk_label=risk_label,
                confidence=round(confidence, 4),
                feature_importances=fi,
                model_version=model_version,
                model_name="readmission",
                explanation=shap_explanation,
                record_id=record_id,
                inference_source=inference_source,
                computed_at=datetime.now(timezone.utc),
            )

        except Exception as exc:  # noqa: BLE001
            record_inference("readmission", tenant_id, "error")
            logger.error(
                "Readmission inference failed",
                extra={"patient_id": patient_id, "error": str(exc)},
            )
            raise HTTPException(
                status_code=500,
                detail=problem_detail(
                    status=500,
                    title="Inference Failed",
                    detail=f"Readmission prediction failed: {type(exc).__name__}",
                    instance="/api/ai/predict-readmission",
                ),
            ) from exc


# ═══════════════════════════════════════════════════════════════════════════════
# POST /api/ai/vitals-anomaly
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/vitals-anomaly",
    response_model=VitalsAnomalyResponse,
    summary="Detect vital sign anomalies",
    description=(
        "Runs Z-score anomaly detection on a patient's recent vitals. "
        "Broadcasts a Redis event if severity is critical."
    ),
)
async def vitals_anomaly_endpoint(
    body: VitalsAnomalyRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_for_request),
) -> VitalsAnomalyResponse:
    """Detect anomalies in patient vital signs."""

    patient_id = str(body.patient_id)
    tenant_id = body.tenant_id
    lookback_hours = body.lookback_hours

    verify_tenant_match(request, tenant_id)
    LogContext.set(tenant_id=tenant_id, patient_id=patient_id)

    with tracer.start_as_current_span("ai.inference.vitals_anomaly") as span:
        set_span_attributes(span, tenant_id=tenant_id, patient_id=patient_id,
                            model_name="vitals_anomaly")
        start = time.perf_counter()

        vitals_repo = VitalsRepository(db)
        rows = await vitals_repo.get_recent_vitals_for_anomaly(
            patient_id=patient_id,
            lookback_hours=lookback_hours,
        )

        if not rows:
            return VitalsAnomalyResponse(
                patient_id=patient_id,
                tenant_id=tenant_id,
                lookback_hours=lookback_hours,
                anomalies=[],
                severity="low",
                affected_vitals=[],
                recommended_action="No vitals data found for the specified period.",
                inference_source="rule_based",
                analysed_at=datetime.now(timezone.utc),
                vitals_count=0,
            )

        # ── Group values by vital_type ─────────────────────────────────────
        from collections import defaultdict
        buckets: dict[str, list[tuple[float, datetime]]] = defaultdict(list)
        for row in rows:
            if row["value"] is not None:
                buckets[row["vital_type"]].append(
                    (float(row["value"]), row["recorded_at"])
                )

        # ── Z-score anomaly detection ──────────────────────────────────────
        from app.config import settings as cfg

        anomaly_dicts: list[dict[str, Any]] = []
        for vital_type, readings in buckets.items():
            values = [v for v, _ in readings]
            if len(values) < 3:
                continue
            mean = statistics.mean(values)
            std = statistics.stdev(values) or 0.001
            for val, ts in readings:
                z = (val - mean) / std
                if abs(z) > cfg.anomaly_zscore_threshold:
                    anomaly_dicts.append({
                        "vital_type": vital_type,
                        "value": val,
                        "z_score": z,
                        "mean": mean,
                        "std": std,
                        "unit": "",
                        "recorded_at": ts,
                    })

        # ── Overall severity ───────────────────────────────────────────────
        severity = _severity_from_anomalies(anomaly_dicts)
        affected_vitals = list({a["vital_type"] for a in anomaly_dicts})

        anomaly_events = [
            AnomalyEvent(
                vital_type=a["vital_type"],
                value=a["value"],
                z_score=round(a["z_score"], 4),
                mean=round(a["mean"], 4),
                std=round(a["std"], 4),
                unit=a.get("unit", ""),
                recorded_at=a["recorded_at"],
                severity_contribution=(
                    "critical" if abs(a["z_score"]) >= 3.5
                    else "medium" if abs(a["z_score"]) >= 2.5
                    else "low"
                ),
            )
            for a in anomaly_dicts
        ]

        # ── Broadcast critical anomalies via Redis pub/sub ─────────────────
        if severity == "critical" and anomaly_dicts:
            import json
            import redis.asyncio as aioredis
            from app.config import settings as cfg2

            worst = max(anomaly_dicts, key=lambda a: abs(a["z_score"]))
            event_payload = json.dumps({
                "event": "anomaly_detected",
                "patient_id": patient_id,
                "tenant_id": tenant_id,
                "severity": "critical",
                "vital_type": worst["vital_type"],
                "value": worst["value"],
                "z_score": round(worst["z_score"], 4),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            try:
                rc = await aioredis.from_url(
                    cfg2.redis_url, socket_connect_timeout=2, socket_timeout=2,
                    decode_responses=True,
                )
                await rc.publish(cfg2.redis_anomaly_channel, event_payload)
                await rc.aclose()
                logger.warning(
                    "Critical anomaly published to Redis channel",
                    extra={"patient_id": patient_id, "vital_type": worst["vital_type"]},
                )
            except Exception as exc:  # noqa: BLE001
                logger.error("Redis publish failed", extra={"error": str(exc)})

        # ── Metrics ────────────────────────────────────────────────────────
        latency = time.perf_counter() - start
        INFERENCE_LATENCY.labels(model="vitals_anomaly").observe(latency)
        record_inference("vitals_anomaly", tenant_id, "success")
        for vt in affected_vitals:
            record_anomaly(tenant_id, severity, vt)

        return VitalsAnomalyResponse(
            patient_id=patient_id,
            tenant_id=tenant_id,
            lookback_hours=lookback_hours,
            anomalies=anomaly_events,
            severity=severity,
            affected_vitals=affected_vitals,
            recommended_action=_recommended_action(severity, affected_vitals),
            inference_source="rule_based",
            analysed_at=datetime.now(timezone.utc),
            vitals_count=len(rows),
        )


# ═══════════════════════════════════════════════════════════════════════════════
# POST /api/ai/diagnose-risk
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/diagnose-risk",
    response_model=DiagnoseRiskResponse,
    summary="Assess ICD-10 comorbidity risk",
    description=(
        "Computes comorbidity risk from ICD-10 co-occurrence patterns "
        "across the tenant population."
    ),
)
async def diagnose_risk_endpoint(
    body: DiagnoseRiskRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_for_request),
) -> DiagnoseRiskResponse:
    """Assess comorbidity interaction risk from ICD-10 codes."""

    patient_id = str(body.patient_id)
    tenant_id = body.tenant_id
    icd10_codes = body.icd10_codes

    verify_tenant_match(request, tenant_id)
    LogContext.set(tenant_id=tenant_id, patient_id=patient_id)

    with tracer.start_as_current_span("ai.inference.diagnose_risk") as span:
        set_span_attributes(span, tenant_id=tenant_id, patient_id=patient_id)

        conditions_repo = ConditionsRepository(db)

        # Charlson score
        comorbidity_score = await conditions_repo.get_comorbidity_score(patient_id)

        # Patient's actual condition records for the submitted codes
        patient_conditions = await conditions_repo.get_conditions_by_codes(
            patient_id=patient_id, icd10_codes=icd10_codes
        )

        # ICD-10 co-occurrence across tenant population
        cooccurrences = await conditions_repo.get_icd10_cooccurrence(
            icd10_codes=icd10_codes, top_n=15
        )

        # Build risk factors from patient conditions
        from app.db.repositories.conditions import CHARLSON_WEIGHTS
        risk_factors = [
            RiskFactor(
                icd10_code=c["icd10_code"],
                description=c.get("description") or c["icd10_code"],
                severity=c.get("severity") or "moderate",
                charlson_weight=CHARLSON_WEIGHTS.get(c["icd10_code"][:3], 0),
            )
            for c in patient_conditions
        ]

        # Build interaction risk matrix
        interaction_risks: dict[str, Any] = {}
        for co in cooccurrences:
            interaction_risks[co["icd10_code"]] = {
                "description": co.get("description", ""),
                "co_occurrence_count": co["co_occurrence_count"],
                "frequency_pct": float(co.get("frequency", 0)),
            }

        # Recommended screenings based on ICD-10 codes
        screenings: list[str] = []
        code_set = set(icd10_codes)
        if any(c.startswith("E11") or c.startswith("E10") for c in code_set):
            screenings.append("HbA1c every 3 months")
            screenings.append("Annual diabetic retinopathy screening")
        if any(c.startswith("I") for c in code_set):
            screenings.append("Echocardiogram if not done in last 12 months")
            screenings.append("Lipid panel every 6 months")
        if any(c.startswith("N18") for c in code_set):
            screenings.append("eGFR and urine albumin-creatinine ratio quarterly")
        if not screenings:
            screenings.append("Annual comprehensive metabolic panel")

        record_inference("diagnose_risk", tenant_id, "success")

        return DiagnoseRiskResponse(
            patient_id=patient_id,
            tenant_id=tenant_id,
            submitted_codes=icd10_codes,
            risk_factors=risk_factors,
            interaction_risks=interaction_risks,
            comorbidity_score=round(comorbidity_score, 2),
            recommended_screenings=screenings,
            assessed_at=datetime.now(timezone.utc),
        )
