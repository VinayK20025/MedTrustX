"""
app/routers/governance.py
==========================
AI governance endpoints for the MedTrustX AI Platform Service.

Endpoints:
  GET  /api/ai/governance/models   — list MLflow registered models
  POST /api/ai/governance/explain  — SHAP explanation for a patient+model
  GET  /api/ai/governance/drift    — KS-test feature drift detection
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db_for_request, verify_tenant_match
from app.models.governance import (
    DriftDetectionResponse,
    ExplainRequest,
    ExplainResponse,
    ModelsListResponse,
)
from app.observability.logging import LogContext, get_logger
from app.observability.tracing import get_tracer
from app.services.drift_detector import detect_feature_drift
from app.services.explainability import compute_shap_explanation
from app.services.feature_store import compute_readmission_features
from app.services.mlflow_client import list_registered_models
from app.db.repositories.vitals import VitalsRepository
from app.db.repositories.conditions import ConditionsRepository
from datetime import datetime, timezone

logger = get_logger(__name__)
tracer = get_tracer(__name__)
router = APIRouter(prefix="/api/ai/governance", tags=["AI Governance"])


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/governance/models
# ═══════════════════════════════════════════════════════════════════════════════

@router.get(
    "/models",
    response_model=ModelsListResponse,
    summary="List registered MLflow models",
    description=(
        "Returns all models from the MLflow registry with version, stage, "
        "training metrics, dataset hash, and run metadata."
    ),
)
async def list_models(request: Request) -> ModelsListResponse:
    """List all registered models from the MLflow model registry."""
    with tracer.start_as_current_span("governance.list_models"):
        try:
            models = await list_registered_models()
        except Exception as exc:  # noqa: BLE001
            logger.error("MLflow list_models failed", extra={"error": str(exc)})
            # Return empty list rather than 500 — governance UI stays functional
            models = []

    logger.info("Model registry listed", extra={"count": len(models)})

    from app.config import settings
    return ModelsListResponse(
        models=models,
        total_count=len(models),
        registry_uri=settings.mlflow_tracking_uri,
        fetched_at=datetime.now(timezone.utc),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# POST /api/ai/governance/explain
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/explain",
    response_model=ExplainResponse,
    summary="SHAP explanation for a patient prediction",
    description=(
        "Runs SHAP KernelExplainer to produce feature attributions and "
        "waterfall chart data for a patient+model combination."
    ),
)
async def explain_prediction(
    body: ExplainRequest,
    request: Request,
    db: AsyncSession = Depends(get_db_for_request),
) -> ExplainResponse:
    """Generate SHAP explanation for a patient's model prediction."""

    patient_id = body.patient_id
    model_name = body.model_name
    tenant_id = body.tenant_id

    verify_tenant_match(request, tenant_id)
    LogContext.set(tenant_id=tenant_id, patient_id=patient_id)

    with tracer.start_as_current_span("governance.explain"):
        vitals_repo = VitalsRepository(db)
        conditions_repo = ConditionsRepository(db)

        # Compute feature vector from DB
        feature_vector = await compute_readmission_features(
            patient_id=patient_id,
            tenant_id=tenant_id,
            vitals_repo=vitals_repo,
            conditions_repo=conditions_repo,
        )
        features_dict = feature_vector.to_dict_for_shap()

        # Use 0.5 as default prediction score (SHAP will call model internally)
        explanation = await compute_shap_explanation(
            patient_id=patient_id,
            tenant_id=tenant_id,
            model_name=model_name,
            feature_vector=features_dict,
            prediction_score=0.5,
        )

    logger.info(
        "SHAP explanation generated",
        extra={"patient_id": patient_id, "model": model_name},
    )
    return explanation


# ═══════════════════════════════════════════════════════════════════════════════
# GET /api/ai/governance/drift
# ═══════════════════════════════════════════════════════════════════════════════

@router.get(
    "/drift",
    response_model=DriftDetectionResponse,
    summary="Detect model feature drift",
    description=(
        "Compares recent inference feature distributions against the training "
        "baseline using Kolmogorov-Smirnov tests. Returns per-feature drift "
        "statistics and a governance recommendation."
    ),
)
async def detect_drift(
    request: Request,
    model_name: str = Query(
        "readmission",
        description="Model to evaluate for drift.",
    ),
    window_days: int = Query(
        7,
        ge=1,
        le=90,
        description="Days of recent inference data to analyse.",
    ),
) -> DriftDetectionResponse:
    """Detect covariate drift for the specified model."""
    with tracer.start_as_current_span("governance.drift_detection"):
        result = await detect_feature_drift(
            model_name=model_name,
            inference_window_days=window_days,
        )

    logger.info(
        "Drift detection completed",
        extra={
            "model": model_name,
            "drift_detected": result.drift_detected,
            "drifted_features": result.drifted_features,
        },
    )
    return result
