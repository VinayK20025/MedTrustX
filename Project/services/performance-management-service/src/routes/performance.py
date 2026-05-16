"""
MedTrustX Performance Management Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.performance import (
    BenchmarkCreate, BenchmarkResponse,
    EvaluationCreate, EvaluationResponse,
    KPICreate, KPIResponse,
    PerformanceRecordCreate, PerformanceRecordResponse,
    ScorecardCreate, ScorecardResponse
)
from src.services import performance_service

router = APIRouter(tags=["Performance Management Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── KPIs ──

@router.post("/kpis", response_model=KPIResponse, status_code=status.HTTP_201_CREATED)
async def create_kpi(data: KPICreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    kpi = await performance_service.create_kpi(session, tid, data)
    await session.commit()
    return kpi

@router.get("/kpis/{kpi_id}", response_model=KPIResponse)
async def get_kpi(kpi_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    kpi = await performance_service.get_kpi(session, tid, kpi_id)
    if not kpi:
        raise HTTPException(status_code=404, detail="KPI not found")
    return kpi


# ── Performance Records ──

@router.post("/performance-records", response_model=PerformanceRecordResponse, status_code=status.HTTP_201_CREATED)
async def record_performance(data: PerformanceRecordCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    record = await performance_service.record_performance(session, tid, data)
    await session.commit()
    return record

@router.get("/performance-records", response_model=List[PerformanceRecordResponse])
async def get_performance_records(entity_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await performance_service.get_performance_records(session, tid, entity_id)


# ── Scorecards ──

@router.post("/scorecards", response_model=ScorecardResponse, status_code=status.HTTP_201_CREATED)
async def generate_scorecard(data: ScorecardCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    scorecard = await performance_service.generate_scorecard(session, tid, data)
    await session.commit()
    return scorecard

@router.get("/scorecards/{user_id}", response_model=List[ScorecardResponse])
async def get_scorecards(user_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await performance_service.get_scorecards(session, tid, user_id)


# ── Benchmarks ──

@router.post("/benchmarks", response_model=BenchmarkResponse, status_code=status.HTTP_201_CREATED)
async def create_benchmark(data: BenchmarkCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    benchmark = await performance_service.create_benchmark(session, tid, data)
    await session.commit()
    return benchmark

@router.get("/benchmarks", response_model=List[BenchmarkResponse])
async def get_benchmarks(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await performance_service.get_benchmarks(session, tid)


# ── Evaluations ──

@router.post("/evaluations", response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
async def submit_evaluation(data: EvaluationCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    eval = await performance_service.submit_evaluation(session, tid, data)
    await session.commit()
    return eval
