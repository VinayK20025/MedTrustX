"""
MedTrustX AI Governance & Explainability Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.governance import ExplainabilityReport, GovernancePolicy, ModelDecision, ModelEntity
from src.schemas.governance import DecisionCreate, ModelCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Models ──

async def create_model(session: AsyncSession, tenant_id: uuid.UUID, data: ModelCreate) -> ModelEntity:
    model = ModelEntity(tenant_id=tenant_id, name=data.name, version=data.version)
    session.add(model)
    await session.flush()
    return model


async def get_model(session: AsyncSession, tenant_id: uuid.UUID, model_id: uuid.UUID) -> ModelEntity | None:
    result = await session.execute(select(ModelEntity).where(and_(ModelEntity.id == model_id, ModelEntity.tenant_id == tenant_id, ModelEntity.deleted_at.is_(None))))
    return result.scalar_one_or_none()


# ── Decisions & Explainability ──

async def record_decision(session: AsyncSession, tenant_id: uuid.UUID, data: DecisionCreate) -> ModelDecision:
    decision = ModelDecision(tenant_id=tenant_id, model_id=data.model_id, input=data.input, output=data.output, decision=data.decision)
    session.add(decision)
    await session.flush()

    # Simulate generating an explainability report (SHAP values)
    simulated_explanation = {"feature_importance": {"age": 0.45, "bp": 0.35, "history": 0.20}}
    report = ExplainabilityReport(tenant_id=tenant_id, model_id=data.model_id, explanation=simulated_explanation)
    session.add(report)
    await session.flush()

    await publish_event("DECISION_RECORDED", tenant_id, decision.id, {"model": str(data.model_id), "decision": data.decision})
    await publish_event("EXPLANATION_GENERATED", tenant_id, report.id, {"model": str(data.model_id)})

    return decision


async def get_decision(session: AsyncSession, tenant_id: uuid.UUID, decision_id: uuid.UUID) -> ModelDecision | None:
    result = await session.execute(select(ModelDecision).where(and_(ModelDecision.id == decision_id, ModelDecision.tenant_id == tenant_id, ModelDecision.deleted_at.is_(None))))
    return result.scalar_one_or_none()


async def list_explainability(session: AsyncSession, tenant_id: uuid.UUID, model_id: uuid.UUID) -> List[ExplainabilityReport]:
    result = await session.execute(select(ExplainabilityReport).where(and_(ExplainabilityReport.model_id == model_id, ExplainabilityReport.tenant_id == tenant_id, ExplainabilityReport.deleted_at.is_(None))).order_by(ExplainabilityReport.created_at.desc()).limit(10))
    return list(result.scalars().all())


# ── Policies ──

async def list_policies(session: AsyncSession, tenant_id: uuid.UUID) -> List[GovernancePolicy]:
    result = await session.execute(select(GovernancePolicy).where(and_(GovernancePolicy.tenant_id == tenant_id, GovernancePolicy.deleted_at.is_(None))))
    return list(result.scalars().all())
