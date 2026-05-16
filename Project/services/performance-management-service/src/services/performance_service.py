"""
MedTrustX Performance Management Service — Business Logic Layer

KPIs, performance records, scorecards, benchmarks, and evaluations.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.performance import (
    Benchmark,
    Evaluation,
    KPI,
    PerformanceRecord,
    Scorecard,
)
from src.schemas.performance import (
    BenchmarkCreate,
    EvaluationCreate,
    KPICreate,
    PerformanceRecordCreate,
    ScorecardCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── KPIs ──

async def create_kpi(
    session: AsyncSession, tenant_id: uuid.UUID, data: KPICreate
) -> KPI:
    kpi = KPI(
        tenant_id=tenant_id,
        name=data.name,
        description=data.description,
        target_value=data.target_value,
    )
    session.add(kpi)
    await session.flush()
    return kpi


async def get_kpi(
    session: AsyncSession, tenant_id: uuid.UUID, kpi_id: uuid.UUID
) -> Optional[KPI]:
    result = await session.execute(
        select(KPI).where(and_(KPI.id == kpi_id, KPI.tenant_id == tenant_id, KPI.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Performance Records ──

async def record_performance(
    session: AsyncSession, tenant_id: uuid.UUID, data: PerformanceRecordCreate
) -> PerformanceRecord:
    record = PerformanceRecord(
        tenant_id=tenant_id,
        entity_id=data.entity_id,
        entity_type=data.entity_type,
        kpi_id=data.kpi_id,
        value=data.value,
    )
    session.add(record)
    await session.flush()

    kpi = await get_kpi(session, tenant_id, data.kpi_id)
    await publish_event("PERFORMANCE_UPDATED", tenant_id, record.id, {"entity_id": str(data.entity_id), "kpi_id": str(data.kpi_id), "value": data.value})

    if kpi and data.value < kpi.target_value:  # Assuming lower is worse, logic might vary per KPI
        await publish_event("KPI_THRESHOLD_BREACHED", tenant_id, record.id, {"kpi": kpi.name, "value": data.value, "target": kpi.target_value})

    return record


async def get_performance_records(
    session: AsyncSession, tenant_id: uuid.UUID, entity_id: uuid.UUID
) -> List[PerformanceRecord]:
    result = await session.execute(
        select(PerformanceRecord).where(and_(PerformanceRecord.entity_id == entity_id, PerformanceRecord.tenant_id == tenant_id, PerformanceRecord.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Scorecards ──

async def generate_scorecard(
    session: AsyncSession, tenant_id: uuid.UUID, data: ScorecardCreate
) -> Scorecard:
    scorecard = Scorecard(
        tenant_id=tenant_id,
        user_id=data.user_id,
        period=data.period,
        score=data.score,
    )
    session.add(scorecard)
    await session.flush()
    return scorecard


async def get_scorecards(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID
) -> List[Scorecard]:
    result = await session.execute(
        select(Scorecard).where(and_(Scorecard.user_id == user_id, Scorecard.tenant_id == tenant_id, Scorecard.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Benchmarks ──

async def create_benchmark(
    session: AsyncSession, tenant_id: uuid.UUID, data: BenchmarkCreate
) -> Benchmark:
    benchmark = Benchmark(
        tenant_id=tenant_id,
        kpi_id=data.kpi_id,
        benchmark_value=data.benchmark_value,
    )
    session.add(benchmark)
    await session.flush()
    return benchmark


async def get_benchmarks(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[Benchmark]:
    result = await session.execute(
        select(Benchmark).where(and_(Benchmark.tenant_id == tenant_id, Benchmark.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Evaluations ──

async def submit_evaluation(
    session: AsyncSession, tenant_id: uuid.UUID, data: EvaluationCreate
) -> Evaluation:
    eval = Evaluation(
        tenant_id=tenant_id,
        user_id=data.user_id,
        evaluator_id=data.evaluator_id,
        rating=data.rating,
        comments=data.comments,
    )
    session.add(eval)
    await session.flush()
    await publish_event("EVALUATION_COMPLETED", tenant_id, eval.id, {"user_id": str(data.user_id), "rating": data.rating})
    return eval
