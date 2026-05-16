"""
MedTrustX Threat Detection Service — Business Logic Layer

Implements behavioural-baseline comparison, anomaly scoring, risk
calculation, and alert generation.  The inference engine uses lightweight
numpy-based heuristics as a shim for a production ML pipeline (e.g.
TensorFlow Serving, ONNX Runtime).
"""
import math
import random
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

import numpy as np
from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.threat import (
    AnomalyModel,
    BehaviorProfile,
    RiskScore,
    ThreatAlert,
    ThreatEvent,
)
from src.schemas.threat import AnalyzeRequest, AnalyzeResponse, ModelTrainRequest
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Constants ──
_SEVERITY_THRESHOLDS = {"critical": 0.85, "high": 0.65, "medium": 0.40, "low": 0.0}
_HIGH_RISK_EVENT_TYPES = {
    "ACCESS_DENIED",
    "MULTIPLE_FAILED_LOGINS",
    "SECRET_ACCESSED",
    "POLICY_VIOLATION",
    "DATA_EXFILTRATION",
}


def _score_to_severity(score: float) -> str:
    for sev, threshold in _SEVERITY_THRESHOLDS.items():
        if score >= threshold:
            return sev
    return "low"


# ── Behavioral Baseline ──

async def _get_or_create_profile(
    session: AsyncSession, tenant_id: uuid.UUID, entity_id: uuid.UUID, entity_type: str
) -> BehaviorProfile:
    result = await session.execute(
        select(BehaviorProfile).where(
            and_(
                BehaviorProfile.tenant_id == tenant_id,
                BehaviorProfile.entity_id == entity_id,
                BehaviorProfile.deleted_at.is_(None),
            )
        )
    )
    profile = result.scalar_one_or_none()

    if profile is None:
        profile = BehaviorProfile(
            tenant_id=tenant_id,
            entity_id=entity_id,
            entity_type=entity_type,
            baseline={
                "event_counts": {},
                "avg_anomaly_score": 0.0,
                "last_seen": datetime.now(timezone.utc).isoformat(),
                "total_events": 0,
            },
        )
        session.add(profile)
        await session.flush()

    return profile


async def _update_profile(
    profile: BehaviorProfile, event_type: str, anomaly_score: float
) -> None:
    bl = profile.baseline or {}
    counts = bl.get("event_counts", {})
    counts[event_type] = counts.get(event_type, 0) + 1
    total = bl.get("total_events", 0) + 1

    # Exponential moving average for anomaly score
    prev_avg = bl.get("avg_anomaly_score", 0.0)
    alpha = 0.3
    new_avg = alpha * anomaly_score + (1 - alpha) * prev_avg

    bl["event_counts"] = counts
    bl["total_events"] = total
    bl["avg_anomaly_score"] = round(new_avg, 4)
    bl["last_seen"] = datetime.now(timezone.utc).isoformat()
    profile.baseline = bl


# ── Anomaly Scoring ──

def _compute_anomaly_score(
    event_type: str,
    event_data: Dict[str, Any],
    baseline: Dict[str, Any],
) -> float:
    """
    Lightweight heuristic anomaly scorer.

    In production this would call an ONNX / TF-Serving model endpoint.
    Here we simulate realistic behaviour using:
        1. Event rarity relative to the entity's baseline
        2. A small random perturbation (simulating model noise)
        3. Multipliers for known high-risk event types
    """
    base_score = 0.10

    # 1 — Event-type rarity
    counts = baseline.get("event_counts", {})
    total = max(baseline.get("total_events", 1), 1)
    event_freq = counts.get(event_type, 0) / total
    rarity_boost = max(0, 1.0 - event_freq) * 0.3
    base_score += rarity_boost

    # 2 — High-risk multiplier
    if event_type in _HIGH_RISK_EVENT_TYPES:
        base_score += 0.25

    # 3 — Contextual signals
    if event_data.get("geo_impossible_travel"):
        base_score += 0.30
    if event_data.get("new_device"):
        base_score += 0.10
    if event_data.get("off_hours"):
        base_score += 0.10

    # 4 — Model noise (simulated)
    noise = np.random.normal(0, 0.05)
    base_score += noise

    return float(np.clip(base_score, 0.0, 1.0))


# ── Risk Score ──

async def _update_risk_score(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    entity_id: uuid.UUID,
    anomaly_score: float,
    threat_type: Optional[str],
) -> int:
    result = await session.execute(
        select(RiskScore).where(
            and_(
                RiskScore.tenant_id == tenant_id,
                RiskScore.entity_id == entity_id,
                RiskScore.deleted_at.is_(None),
            )
        )
    )
    risk = result.scalar_one_or_none()

    new_score = int(anomaly_score * 100)

    factors: Dict[str, Any] = {}
    if threat_type:
        factors["last_threat"] = threat_type

    if risk is None:
        risk = RiskScore(
            tenant_id=tenant_id,
            entity_id=entity_id,
            score=new_score,
            factors=factors,
        )
        session.add(risk)
    else:
        # Weighted blend — recent anomaly has 40% weight
        risk.score = int(0.4 * new_score + 0.6 * risk.score)
        risk.calculated_at = datetime.now(timezone.utc)
        if factors:
            existing = risk.factors or {}
            existing.update(factors)
            risk.factors = existing

    await session.flush()

    await publish_event(
        "RISK_SCORE_UPDATED",
        tenant_id,
        entity_id,
        {"score": risk.score},
    )

    return risk.score


# ── Core Analysis Pipeline ──

async def analyze(
    session: AsyncSession, tenant_id: uuid.UUID, data: AnalyzeRequest
) -> AnalyzeResponse:
    # 1 — Fetch / create profile
    profile = await _get_or_create_profile(session, tenant_id, data.entity_id, data.entity_type)

    # 2 — Compute anomaly score
    anomaly_score = _compute_anomaly_score(data.event_type, data.event_data, profile.baseline)
    severity = _score_to_severity(anomaly_score)

    # 3 — Determine threat type
    threat_type: Optional[str] = None
    recommended_action: Optional[str] = None

    if anomaly_score >= 0.85:
        threat_type = "account_takeover_suspected"
        recommended_action = "deny_access"
    elif anomaly_score >= 0.65:
        threat_type = "insider_threat_indicator"
        recommended_action = "step_up_mfa"
    elif anomaly_score >= 0.40:
        threat_type = "behavioral_deviation"
        recommended_action = "monitor"

    # 4 — Record threat event
    event = ThreatEvent(
        tenant_id=tenant_id,
        entity_id=data.entity_id,
        entity_type=data.entity_type,
        anomaly_score=round(anomaly_score, 4),
        severity=severity,
        event_data=data.event_data,
    )
    session.add(event)
    await session.flush()

    # 5 — Update baseline
    await _update_profile(profile, data.event_type, anomaly_score)

    # 6 — Update risk score
    risk_score = await _update_risk_score(session, tenant_id, data.entity_id, anomaly_score, threat_type)

    # 7 — Generate alert if high/critical
    if severity in ("high", "critical"):
        alert = ThreatAlert(
            tenant_id=tenant_id,
            threat_type=threat_type or "unknown",
            severity=severity,
            status="open",
            description=f"Anomaly detected for {data.entity_type} {data.entity_id}: {threat_type}",
            alert_data={"entity_id": str(data.entity_id), "anomaly_score": anomaly_score},
        )
        session.add(alert)
        await session.flush()

        await publish_event(
            "THREAT_DETECTED",
            tenant_id,
            alert.id,
            {"type": threat_type, "severity": severity, "entity_id": str(data.entity_id)},
        )

    return AnalyzeResponse(
        anomaly_score=round(anomaly_score, 4),
        severity=severity,
        threat_type=threat_type,
        recommended_action=recommended_action,
        risk_score=risk_score,
    )


# ── Read Helpers ──

async def get_threat_events(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[ThreatEvent]:
    result = await session.execute(
        select(ThreatEvent)
        .where(and_(ThreatEvent.tenant_id == tenant_id, ThreatEvent.deleted_at.is_(None)))
        .order_by(desc(ThreatEvent.detected_at))
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_risk_score(
    session: AsyncSession, tenant_id: uuid.UUID, entity_id: uuid.UUID
) -> Optional[RiskScore]:
    result = await session.execute(
        select(RiskScore).where(
            and_(
                RiskScore.tenant_id == tenant_id,
                RiskScore.entity_id == entity_id,
                RiskScore.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def get_alerts(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[ThreatAlert]:
    result = await session.execute(
        select(ThreatAlert)
        .where(and_(ThreatAlert.tenant_id == tenant_id, ThreatAlert.deleted_at.is_(None)))
        .order_by(desc(ThreatAlert.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())


# ── Model Training Stub ──

async def trigger_training(
    session: AsyncSession, tenant_id: uuid.UUID, data: ModelTrainRequest
) -> AnomalyModel:
    model = AnomalyModel(
        tenant_id=tenant_id,
        model_name=data.model_name,
        version="0.1.0",
        metadata_blob={
            "status": "training_queued",
            "parameters": data.parameters,
            "queued_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    session.add(model)
    await session.flush()
    return model
