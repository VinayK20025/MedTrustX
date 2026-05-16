"""
MedTrustX AI Platform Service — Business Logic Layer

Implements the full ML lifecycle: model registry, feature ingestion,
multi-model inference (clinical, operational, security), training job
management, and feedback collection for continuous learning.

The inference engine uses numpy-based heuristic models as production
shims — in deployment these would be replaced by calls to TensorFlow
Serving, ONNX Runtime, or SageMaker endpoints.
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

import numpy as np
from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.ai import (
    AIModel,
    AIPrediction,
    FeatureSet,
    PredictionFeedback,
    TrainingJob,
)
from src.schemas.ai import FeedbackRequest, PredictRequest, TrainRequest
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ───────────────────────── Model Inference Shims ─────────────────────────
# Each model produces a Dict[str, Any] output and a float confidence.

def _icu_risk_model(features: Dict[str, Any]) -> tuple[Dict[str, Any], float]:
    """ICU patient deterioration risk."""
    age = features.get("age", 50)
    vitals_score = features.get("vitals_score", 0.5)
    comorbidities = features.get("comorbidity_count", 0)

    risk = float(np.clip(
        0.1 + (age / 200) + (1 - vitals_score) * 0.4 + comorbidities * 0.05 + np.random.normal(0, 0.03),
        0.0, 1.0,
    ))
    label = "critical" if risk > 0.7 else ("high" if risk > 0.5 else ("medium" if risk > 0.3 else "low"))
    return {"risk_score": round(risk, 4), "label": label, "model": "icu_risk_v1"}, round(1.0 - abs(risk - 0.5), 4)


def _readmission_model(features: Dict[str, Any]) -> tuple[Dict[str, Any], float]:
    """30-day readmission probability."""
    prior_admissions = features.get("prior_admissions", 0)
    los_days = features.get("length_of_stay", 3)
    prob = float(np.clip(0.05 + prior_admissions * 0.08 + (los_days / 30) * 0.2 + np.random.normal(0, 0.02), 0.0, 1.0))
    return {"readmission_probability": round(prob, 4), "model": "readmission_v1"}, round(0.85 + np.random.uniform(0, 0.1), 4)


def _bed_demand_model(features: Dict[str, Any]) -> tuple[Dict[str, Any], float]:
    """Bed demand forecasting for the next 24h."""
    current_occupancy = features.get("current_occupancy", 0.7)
    day_of_week = features.get("day_of_week", 3)
    seasonal_factor = 1.0 + 0.05 * np.sin(2 * np.pi * day_of_week / 7)
    predicted = float(np.clip(current_occupancy * seasonal_factor + np.random.normal(0, 0.02), 0.0, 1.0))
    return {"predicted_occupancy": round(predicted, 4), "beds_needed": int(predicted * 100), "model": "bed_demand_v1"}, round(0.80 + np.random.uniform(0, 0.15), 4)


def _fraud_detection_model(features: Dict[str, Any]) -> tuple[Dict[str, Any], float]:
    """Billing fraud probability scorer."""
    amount = features.get("claim_amount", 1000)
    avg_amount = features.get("avg_claim_amount", 800)
    deviation = abs(amount - avg_amount) / max(avg_amount, 1)
    score = float(np.clip(deviation * 0.3 + np.random.normal(0, 0.05), 0.0, 1.0))
    flagged = score > 0.5
    return {"fraud_score": round(score, 4), "flagged": flagged, "model": "fraud_v1"}, round(0.75 + np.random.uniform(0, 0.2), 4)


def _security_risk_model(features: Dict[str, Any]) -> tuple[Dict[str, Any], float]:
    """Adaptive security risk score (feeds ZTA Engine)."""
    anomaly_count = features.get("recent_anomaly_count", 0)
    failed_logins = features.get("failed_logins_24h", 0)
    score = float(np.clip(anomaly_count * 0.15 + failed_logins * 0.1 + np.random.normal(0, 0.03), 0.0, 1.0))
    action = "deny" if score > 0.8 else ("mfa" if score > 0.5 else "allow")
    return {"risk_score": round(score, 4), "recommended_action": action, "model": "security_risk_v1"}, round(0.90 + np.random.uniform(0, 0.08), 4)


_MODEL_DISPATCH: Dict[str, Any] = {
    "icu_risk": _icu_risk_model,
    "readmission": _readmission_model,
    "bed_demand": _bed_demand_model,
    "fraud_detection": _fraud_detection_model,
    "security_risk": _security_risk_model,
}

_DEFAULT_MODEL_FN = _icu_risk_model


# ───────────────────────── Service Functions ─────────────────────────

async def _get_or_create_model(
    session: AsyncSession, tenant_id: uuid.UUID, model_name: str
) -> AIModel:
    result = await session.execute(
        select(AIModel).where(
            and_(AIModel.tenant_id == tenant_id, AIModel.model_name == model_name, AIModel.deleted_at.is_(None))
        )
        .order_by(desc(AIModel.created_at))
        .limit(1)
    )
    model = result.scalar_one_or_none()
    if model is None:
        model = AIModel(
            tenant_id=tenant_id,
            model_name=model_name,
            version="0.1.0",
            status="active",
            metadata_blob={"auto_created": True},
        )
        session.add(model)
        await session.flush()
    return model


# ── Predict ──

async def predict(
    session: AsyncSession, tenant_id: uuid.UUID, data: PredictRequest
) -> AIPrediction:
    model = await _get_or_create_model(session, tenant_id, data.model_name)

    # Store features
    feature_set = FeatureSet(
        tenant_id=tenant_id,
        entity_id=data.entity_id,
        feature_vector=data.features,
    )
    session.add(feature_set)

    # Run inference
    inference_fn = _MODEL_DISPATCH.get(data.model_name, _DEFAULT_MODEL_FN)
    output, confidence = inference_fn(data.features)

    prediction = AIPrediction(
        tenant_id=tenant_id,
        model_id=model.id,
        entity_id=data.entity_id,
        output=output,
        confidence=confidence,
    )
    session.add(prediction)
    await session.flush()

    await publish_event(
        "PREDICTION_GENERATED",
        tenant_id,
        prediction.id,
        {"model": data.model_name, "entity_id": str(data.entity_id), "confidence": confidence},
    )

    return prediction


# ── Models ──

async def get_model(
    session: AsyncSession, tenant_id: uuid.UUID, model_id: uuid.UUID
) -> Optional[AIModel]:
    result = await session.execute(
        select(AIModel).where(
            and_(AIModel.id == model_id, AIModel.tenant_id == tenant_id, AIModel.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def list_models(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[AIModel]:
    result = await session.execute(
        select(AIModel).where(and_(AIModel.tenant_id == tenant_id, AIModel.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Training ──

async def trigger_training(
    session: AsyncSession, tenant_id: uuid.UUID, data: TrainRequest
) -> TrainingJob:
    model = await _get_or_create_model(session, tenant_id, data.model_name)
    model.status = "training"

    job = TrainingJob(
        tenant_id=tenant_id,
        model_id=model.id,
        status="queued",
        hyperparams=data.hyperparams,
        metrics={},
    )
    session.add(job)
    await session.flush()
    return job


# ── Prediction History ──

async def get_predictions(
    session: AsyncSession, tenant_id: uuid.UUID, entity_id: uuid.UUID, limit: int = 20
) -> List[AIPrediction]:
    result = await session.execute(
        select(AIPrediction)
        .where(and_(AIPrediction.tenant_id == tenant_id, AIPrediction.entity_id == entity_id, AIPrediction.deleted_at.is_(None)))
        .order_by(desc(AIPrediction.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())


# ── Feedback ──

async def record_feedback(
    session: AsyncSession, tenant_id: uuid.UUID, data: FeedbackRequest
) -> PredictionFeedback:
    fb = PredictionFeedback(
        tenant_id=tenant_id,
        prediction_id=data.prediction_id,
        actual_outcome=data.actual_outcome,
    )
    session.add(fb)
    await session.flush()
    return fb
