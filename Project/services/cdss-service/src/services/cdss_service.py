"""
MedTrustX CDSS Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import and_, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.cdss import (
    CDSSAlert,
    CDSSEvaluation,
    CDSSRecommendation,
    CDSSRule,
)
from src.schemas.cdss import (
    CDSSAlertCreate,
    CDSSEvaluateRequest,
    CDSSRecommendationCreate,
    CDSSRuleCreate,
    CDSSRuleUpdate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Rules ───────────────────────────────────────────────────────
async def create_rule(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: CDSSRuleCreate,
) -> CDSSRule:
    rule = CDSSRule(
        tenant_id=tenant_id,
        name=data.name,
        description=data.description,
        rule_type=data.rule_type,
        definition=data.definition,
        active=data.active,
    )
    session.add(rule)
    await session.flush()
    return rule


async def get_rule(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    rule_id: uuid.UUID,
) -> Optional[CDSSRule]:
    result = await session.execute(
        select(CDSSRule)
        .where(
            and_(
                CDSSRule.id == rule_id,
                CDSSRule.tenant_id == tenant_id,
                CDSSRule.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def get_active_rules(
    session: AsyncSession,
    tenant_id: uuid.UUID,
) -> List[CDSSRule]:
    result = await session.execute(
        select(CDSSRule)
        .where(
            and_(
                CDSSRule.tenant_id == tenant_id,
                CDSSRule.active.is_(True),
                CDSSRule.deleted_at.is_(None),
            )
        )
    )
    return list(result.scalars().all())


async def update_rule(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    rule_id: uuid.UUID,
    data: CDSSRuleUpdate,
) -> Optional[CDSSRule]:
    rule = await get_rule(session, tenant_id, rule_id)
    if not rule:
        return None

    if data.name is not None:
        rule.name = data.name
    if data.description is not None:
        rule.description = data.description
    if data.rule_type is not None:
        rule.rule_type = data.rule_type
    if data.definition is not None:
        rule.definition = data.definition
    if data.active is not None:
        rule.active = data.active

    rule.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return rule


# ── Engine / Evaluator ──────────────────────────────────────────
async def evaluate_context(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: CDSSEvaluateRequest,
) -> CDSSEvaluation:
    """
    Mock inference engine. In a real system, this would evaluate the `context`
    against all active rules or ML models to generate alerts and recommendations.
    """
    # 1. Fetch active rules (omitted from actual execution loop for mock)
    # rules = await get_active_rules(session, tenant_id)
    
    # 2. Run inference logic...
    # Mocking a result
    mock_result = {
        "triggered_rules": [],
        "inferred_risk_score": 0.15,
        "status": "evaluated",
    }

    # 3. Create Audit Trail
    evaluation = CDSSEvaluation(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        input_data=data.context,
        result=mock_result,
    )
    session.add(evaluation)
    await session.flush()

    await publish_event(
        "CDSS_RULE_EVALUATED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={"evaluation_id": str(evaluation.id)},
    )

    return evaluation


# ── Alerts ──────────────────────────────────────────────────────
async def trigger_alert(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: CDSSAlertCreate,
) -> CDSSAlert:
    alert = CDSSAlert(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        alert_type=data.alert_type,
        severity=data.severity,
        message=data.message,
    )
    session.add(alert)
    await session.flush()

    await publish_event(
        "CDSS_ALERT_TRIGGERED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={
            "alert_id": str(alert.id),
            "alert_type": data.alert_type,
            "severity": data.severity,
        },
    )
    return alert


async def resolve_alert(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    alert_id: uuid.UUID,
) -> Optional[CDSSAlert]:
    result = await session.execute(
        select(CDSSAlert)
        .where(
            and_(
                CDSSAlert.id == alert_id,
                CDSSAlert.tenant_id == tenant_id,
                CDSSAlert.deleted_at.is_(None),
            )
        )
    )
    alert = result.scalar_one_or_none()
    if not alert or alert.status == "resolved":
        return alert

    alert.status = "resolved"
    alert.resolved_at = datetime.now(timezone.utc)
    alert.updated_at = alert.resolved_at
    await session.flush()

    await publish_event(
        "CDSS_ALERT_RESOLVED",
        tenant_id=tenant_id,
        patient_id=alert.patient_id,
        payload={"alert_id": str(alert.id)},
    )
    return alert


async def get_patient_alerts(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[CDSSAlert]:
    result = await session.execute(
        select(CDSSAlert)
        .where(
            and_(
                CDSSAlert.patient_id == patient_id,
                CDSSAlert.tenant_id == tenant_id,
                CDSSAlert.deleted_at.is_(None),
            )
        )
        .order_by(desc(CDSSAlert.triggered_at))
    )
    return list(result.scalars().all())


# ── Recommendations ─────────────────────────────────────────────
async def add_recommendation(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: CDSSRecommendationCreate,
) -> CDSSRecommendation:
    rec = CDSSRecommendation(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        recommendation=data.recommendation,
        source=data.source,
        confidence_score=data.confidence_score,
    )
    session.add(rec)
    await session.flush()

    await publish_event(
        "CDSS_RECOMMENDATION_GENERATED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={
            "recommendation_id": str(rec.id),
            "source": data.source,
            "confidence": data.confidence_score,
        },
    )
    return rec


async def get_patient_recommendations(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[CDSSRecommendation]:
    result = await session.execute(
        select(CDSSRecommendation)
        .where(
            and_(
                CDSSRecommendation.patient_id == patient_id,
                CDSSRecommendation.tenant_id == tenant_id,
                CDSSRecommendation.deleted_at.is_(None),
            )
        )
        .order_by(desc(CDSSRecommendation.created_at))
    )
    return list(result.scalars().all())
