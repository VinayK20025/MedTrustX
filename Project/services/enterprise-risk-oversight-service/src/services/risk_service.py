"""
MedTrustX Enterprise Risk Oversight Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.risk import MitigationPlan, Risk, RiskAssessment, RiskEvent
from src.schemas.risk import AssessmentCreate, RiskCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def create_risk(session: AsyncSession, tenant_id: uuid.UUID, data: RiskCreate) -> Risk:
    risk = Risk(tenant_id=tenant_id, category=data.category, description=data.description, severity=data.severity)
    session.add(risk)
    await session.flush()
    # Record identification event
    evt = RiskEvent(tenant_id=tenant_id, risk_id=risk.id, event_type="identified", details={"category": data.category, "severity": data.severity})
    session.add(evt)
    await session.flush()
    await publish_event("RISK_IDENTIFIED", tenant_id, risk.id, {"category": data.category, "severity": data.severity})
    return risk


async def get_risk(session: AsyncSession, tenant_id: uuid.UUID, risk_id: uuid.UUID) -> Risk | None:
    result = await session.execute(
        select(Risk).where(
            and_(Risk.id == risk_id, Risk.tenant_id == tenant_id, Risk.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def create_assessment(session: AsyncSession, tenant_id: uuid.UUID, data: AssessmentCreate) -> RiskAssessment:
    assessment = RiskAssessment(tenant_id=tenant_id, risk_id=data.risk_id, score=data.score, likelihood=data.likelihood, impact=data.impact)
    session.add(assessment)
    await session.flush()
    # Auto-generate mitigation if score exceeds threshold
    if data.score >= 0.7:
        mitig = MitigationPlan(tenant_id=tenant_id, risk_id=data.risk_id, actions={"recommendation": "escalate_to_leadership", "auto_generated": True}, status="pending")
        session.add(mitig)
        await session.flush()
        await publish_event("MITIGATION_TRIGGERED", tenant_id, mitig.id, {"risk_id": str(data.risk_id), "score": data.score})
    return assessment


async def list_mitigation(session: AsyncSession, tenant_id: uuid.UUID) -> List[MitigationPlan]:
    result = await session.execute(
        select(MitigationPlan).where(
            and_(MitigationPlan.tenant_id == tenant_id, MitigationPlan.deleted_at.is_(None))
        ).order_by(MitigationPlan.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())


async def list_events(session: AsyncSession, tenant_id: uuid.UUID) -> List[RiskEvent]:
    result = await session.execute(
        select(RiskEvent).where(
            and_(RiskEvent.tenant_id == tenant_id, RiskEvent.deleted_at.is_(None))
        ).order_by(RiskEvent.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
