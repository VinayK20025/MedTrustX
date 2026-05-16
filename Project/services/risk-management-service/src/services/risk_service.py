"""
MedTrustX Risk Management Service — Business Logic Layer

Risks, assessments, mitigations, and indicators.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.risk import (
    MitigationPlan,
    Risk,
    RiskAssessment,
    RiskIndicator,
)
from src.schemas.risk import (
    MitigationPlanCreate,
    RiskAssessmentCreate,
    RiskCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Risks ──

async def create_risk(
    session: AsyncSession, tenant_id: uuid.UUID, data: RiskCreate
) -> Risk:
    score = data.likelihood * data.impact
    risk = Risk(
        tenant_id=tenant_id,
        risk_type=data.risk_type,
        description=data.description,
        likelihood=data.likelihood,
        impact=data.impact,
        score=score,
    )
    session.add(risk)
    await session.flush()
    await publish_event("RISK_IDENTIFIED", tenant_id, risk.id, {"type": data.risk_type, "score": score})
    if score >= 15:
        await publish_event("RISK_ESCALATED", tenant_id, risk.id, {"type": data.risk_type, "score": score})
    return risk


async def get_risk(
    session: AsyncSession, tenant_id: uuid.UUID, risk_id: uuid.UUID
) -> Optional[Risk]:
    result = await session.execute(
        select(Risk).where(and_(Risk.id == risk_id, Risk.tenant_id == tenant_id, Risk.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


async def get_high_risks(
    session: AsyncSession, tenant_id: uuid.UUID, threshold: int = 15
) -> List[Risk]:
    result = await session.execute(
        select(Risk).where(and_(Risk.score >= threshold, Risk.tenant_id == tenant_id, Risk.deleted_at.is_(None)))
        .order_by(Risk.score.desc())
    )
    return list(result.scalars().all())


# ── Risk Assessments ──

async def assess_risk(
    session: AsyncSession, tenant_id: uuid.UUID, risk_id: uuid.UUID, data: RiskAssessmentCreate
) -> RiskAssessment:
    risk = await get_risk(session, tenant_id, risk_id)
    if risk:
        risk.score = data.score
        risk.status = "assessed"

    assessment = RiskAssessment(
        tenant_id=tenant_id,
        risk_id=risk_id,
        assessed_by=data.assessed_by,
        score=data.score,
    )
    session.add(assessment)
    await session.flush()
    
    if data.score >= 15:
        await publish_event("RISK_ESCALATED", tenant_id, risk_id, {"score": data.score})
        
    return assessment


# ── Mitigation Plans ──

async def create_mitigation_plan(
    session: AsyncSession, tenant_id: uuid.UUID, data: MitigationPlanCreate
) -> MitigationPlan:
    plan = MitigationPlan(
        tenant_id=tenant_id,
        risk_id=data.risk_id,
        actions=data.actions,
    )
    session.add(plan)
    
    risk = await get_risk(session, tenant_id, data.risk_id)
    if risk:
        risk.status = "mitigated"

    await session.flush()
    await publish_event("MITIGATION_TRIGGERED", tenant_id, plan.id, {"risk_id": str(data.risk_id)})
    return plan


async def get_mitigation_plan(
    session: AsyncSession, tenant_id: uuid.UUID, plan_id: uuid.UUID
) -> Optional[MitigationPlan]:
    result = await session.execute(
        select(MitigationPlan).where(and_(MitigationPlan.id == plan_id, MitigationPlan.tenant_id == tenant_id, MitigationPlan.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Indicators ──

async def get_risk_indicators(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[RiskIndicator]:
    result = await session.execute(
        select(RiskIndicator).where(and_(RiskIndicator.tenant_id == tenant_id, RiskIndicator.deleted_at.is_(None)))
        .order_by(RiskIndicator.recorded_at.desc()).limit(limit)
    )
    return list(result.scalars().all())
