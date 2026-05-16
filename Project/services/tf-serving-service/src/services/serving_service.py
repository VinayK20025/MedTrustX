"""
MedTrustX TF Serving Service — Inference Engine

Production-grade inference layer using numpy heuristic shims.
Each model produces TF-Serving-compatible output (predictions list).
Supports predict, classify, and regress operations.
"""
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import numpy as np
from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.serving import (
    ABExperiment,
    InferenceLog,
    ModelHealthCheck,
    ModelVersion,
    ServingModelConfig,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Model Inference Shims ──

def _icu_risk_predict(instances: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """ICU deterioration risk scoring."""
    results = []
    for inst in instances:
        age = inst.get("age", 50)
        vitals_score = inst.get("vitals_score", 0.5)
        comorbidities = inst.get("comorbidity_count", 0)
        score = float(np.clip(
            0.1 + (age / 200) + vitals_score * 0.3 + comorbidities * 0.08 + np.random.normal(0, 0.02),
            0.0, 1.0,
        ))
        results.append({"risk_score": round(score, 4), "label": "critical" if score > 0.8 else "high" if score > 0.6 else "medium" if score > 0.3 else "low"})
    return results


def _fraud_predict(instances: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Billing fraud detection."""
    results = []
    for inst in instances:
        amount = inst.get("amount", 0)
        freq = inst.get("claim_frequency", 1)
        score = float(np.clip(
            0.02 + (amount / 100_000) + freq * 0.05 + np.random.normal(0, 0.03),
            0.0, 1.0,
        ))
        results.append({"fraud_score": round(score, 4), "flagged": score > 0.65})
    return results


def _readmission_predict(instances: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """30-day readmission probability."""
    results = []
    for inst in instances:
        los = inst.get("length_of_stay", 3)
        prior_admits = inst.get("prior_admissions", 0)
        score = float(np.clip(
            0.05 + (prior_admits * 0.1) + (los / 30) + np.random.normal(0, 0.03),
            0.0, 1.0,
        ))
        results.append({"readmission_probability": round(score, 4)})
    return results


def _triage_classify(instances: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Emergency triage classification."""
    results = []
    for inst in instances:
        severity = inst.get("symptom_severity", 3)
        vitals_concern = inst.get("vitals_concern", 0.5)
        score = float(np.clip(severity / 5 + vitals_concern * 0.3, 0.0, 1.0))
        if score > 0.8:
            label = "immediate"
        elif score > 0.6:
            label = "emergent"
        elif score > 0.35:
            label = "urgent"
        else:
            label = "non-urgent"
        results.append({"triage_level": label, "confidence": round(score, 4)})
    return results


def _security_risk_regress(instances: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Adaptive security risk regression."""
    results = []
    for inst in instances:
        anomaly = inst.get("anomaly_score", 0.1)
        failed = inst.get("failed_attempts", 0)
        score = float(np.clip(anomaly + failed * 0.12 + np.random.normal(0, 0.02), 0.0, 1.0))
        results.append({"risk_value": round(score, 4)})
    return results


_MODEL_DISPATCH: Dict[str, Dict[str, Any]] = {
    "icu_risk": {"predict": _icu_risk_predict, "classify": _triage_classify, "regress": _security_risk_regress},
    "fraud_detection": {"predict": _fraud_predict, "classify": _fraud_predict, "regress": _fraud_predict},
    "readmission": {"predict": _readmission_predict, "classify": _readmission_predict, "regress": _readmission_predict},
    "triage": {"predict": _triage_classify, "classify": _triage_classify, "regress": _triage_classify},
    "security_risk": {"predict": _security_risk_regress, "classify": _security_risk_regress, "regress": _security_risk_regress},
}


# ── Inference Execution ──

async def run_inference(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    model_name: str,
    operation: str,
    instances: List[Dict[str, Any]],
    entity_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Execute inference and log the request."""
    start = time.perf_counter()

    dispatch = _MODEL_DISPATCH.get(model_name)
    if not dispatch:
        raise ValueError(f"Unknown model: {model_name}")

    op_fn = dispatch.get(operation, dispatch.get("predict"))
    if not op_fn:
        raise ValueError(f"Unsupported operation: {operation}")

    predictions = op_fn(instances)

    latency_ms = round((time.perf_counter() - start) * 1000, 2)

    # Audit log
    log = InferenceLog(
        tenant_id=tenant_id,
        model_name=model_name,
        model_version="v1",
        entity_id=entity_id,
        latency_ms=latency_ms,
        input_summary={"count": len(instances), "keys": list(instances[0].keys()) if instances else []},
        output_summary={"count": len(predictions)},
    )
    session.add(log)
    await session.flush()

    await publish_event(
        "PREDICTION_RETURNED", tenant_id, None,
        {"model": model_name, "operation": operation, "entity_id": entity_id, "latency_ms": latency_ms},
    )

    return {"model_name": model_name, "model_version": "v1", "predictions" if operation == "predict" else "results": predictions, "latency_ms": latency_ms}


# ── Model Registry Queries ──

async def get_model_info(
    session: AsyncSession, tenant_id: uuid.UUID, model_name: str
) -> Optional[ServingModelConfig]:
    result = await session.execute(
        select(ServingModelConfig).where(
            and_(ServingModelConfig.name == model_name, ServingModelConfig.tenant_id == tenant_id, ServingModelConfig.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def list_models(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[ServingModelConfig]:
    result = await session.execute(
        select(ServingModelConfig).where(and_(ServingModelConfig.tenant_id == tenant_id, ServingModelConfig.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


async def get_model_version(
    session: AsyncSession, tenant_id: uuid.UUID, model_name: str, version: str
) -> Optional[ModelVersion]:
    result = await session.execute(
        select(ModelVersion).join(ServingModelConfig, ModelVersion.model_config_id == ServingModelConfig.id).where(
            and_(
                ServingModelConfig.name == model_name,
                ServingModelConfig.tenant_id == tenant_id,
                ModelVersion.version == version,
                ModelVersion.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def get_inference_logs(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[InferenceLog]:
    result = await session.execute(
        select(InferenceLog)
        .where(and_(InferenceLog.tenant_id == tenant_id, InferenceLog.deleted_at.is_(None)))
        .order_by(desc(InferenceLog.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())
