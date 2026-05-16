"""
MedTrustX Performance Intelligence Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.performance import Benchmark, OptimizationInsight, PerformanceMetric, PerformanceScore
from src.schemas.performance import EvaluateRequest
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def get_performance(session: AsyncSession, tenant_id: uuid.UUID, service_name: str) -> List[PerformanceMetric]:
    result = await session.execute(
        select(PerformanceMetric).where(
            and_(
                PerformanceMetric.tenant_id == tenant_id,
                PerformanceMetric.service_name == service_name,
                PerformanceMetric.deleted_at.is_(None),
            )
        ).order_by(PerformanceMetric.timestamp.desc()).limit(100)
    )
    return list(result.scalars().all())


async def evaluate_performance(session: AsyncSession, tenant_id: uuid.UUID, data: EvaluateRequest) -> PerformanceScore:
    # Mock scoring logic — production would aggregate real metrics
    score_val = 0.87
    score = PerformanceScore(tenant_id=tenant_id, service_name=data.service_name, score=score_val)
    session.add(score)
    await session.flush()

    # Generate optimization insight if score is below threshold
    if score_val < 0.9:
        insight = OptimizationInsight(
            tenant_id=tenant_id,
            service_name=data.service_name,
            insight=f"Service '{data.service_name}' scored {score_val:.2f}. Consider horizontal scaling or query optimization.",
            impact=0.15,
        )
        session.add(insight)
        await session.flush()
        await publish_event("OPTIMIZATION_RECOMMENDED", tenant_id, insight.id, {"service": data.service_name, "score": score_val})

    if score_val < 0.7:
        await publish_event("PERFORMANCE_DEGRADED", tenant_id, score.id, {"service": data.service_name, "score": score_val})

    await publish_event("BENCHMARK_UPDATED", tenant_id, score.id, {"service": data.service_name, "score": score_val})
    return score


async def list_benchmarks(session: AsyncSession, tenant_id: uuid.UUID) -> List[Benchmark]:
    result = await session.execute(
        select(Benchmark).where(
            and_(Benchmark.tenant_id == tenant_id, Benchmark.deleted_at.is_(None))
        )
    )
    return list(result.scalars().all())


async def list_insights(session: AsyncSession, tenant_id: uuid.UUID) -> List[OptimizationInsight]:
    result = await session.execute(
        select(OptimizationInsight).where(
            and_(OptimizationInsight.tenant_id == tenant_id, OptimizationInsight.deleted_at.is_(None))
        ).order_by(OptimizationInsight.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
