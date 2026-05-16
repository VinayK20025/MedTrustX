"""
MedTrustX Legal Risk Analytics Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.risk import PredictiveModel, RiskFactor, RiskScore, TrendAnalysis
from src.schemas.risk import RiskEvaluateRequest
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def evaluate_risk(session: AsyncSession, tenant_id: uuid.UUID, data: RiskEvaluateRequest) -> RiskScore:
    # Dummy mock risk logic representing an ML model pipeline call
    score_val = 0.85
    risk_level = "high" if score_val > 0.8 else "medium"

    score = RiskScore(tenant_id=tenant_id, case_id=data.case_id, risk_level=risk_level, score=score_val)
    session.add(score)
    
    # Adding a mock factor
    factor = RiskFactor(tenant_id=tenant_id, case_id=data.case_id, factor_name="late_discovery_filing", impact=0.4)
    session.add(factor)

    await session.flush()
    await publish_event("RISK_EVALUATED", tenant_id, score.id, {"case_id": str(data.case_id), "score": score_val})
    
    if risk_level == "high":
        await publish_event("HIGH_RISK_DETECTED", tenant_id, score.id, {"case_id": str(data.case_id), "score": score_val})
        
    return score


async def get_risk(session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID) -> RiskScore | None:
    result = await session.execute(
        select(RiskScore).where(
            and_(RiskScore.case_id == case_id, RiskScore.tenant_id == tenant_id, RiskScore.deleted_at.is_(None))
        ).order_by(RiskScore.created_at.desc())
    )
    return result.scalars().first()


async def list_trends(session: AsyncSession, tenant_id: uuid.UUID) -> List[TrendAnalysis]:
    result = await session.execute(
        select(TrendAnalysis).where(
            and_(TrendAnalysis.tenant_id == tenant_id, TrendAnalysis.deleted_at.is_(None))
        ).order_by(TrendAnalysis.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())


async def list_models(session: AsyncSession, tenant_id: uuid.UUID) -> List[PredictiveModel]:
    result = await session.execute(
        select(PredictiveModel).where(
            and_(PredictiveModel.tenant_id == tenant_id, PredictiveModel.deleted_at.is_(None))
        )
    )
    return list(result.scalars().all())
