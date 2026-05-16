"""
MedTrustX Performance Intelligence Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.performance import BenchmarkResponse, EvaluateRequest, InsightResponse, MetricResponse, ScoreResponse
from src.services import performance_service

router = APIRouter(tags=["Performance Intelligence Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get("/performance/{service_name}", response_model=List[MetricResponse])
async def get_performance(service_name: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await performance_service.get_performance(session, tid, service_name)

@router.post("/performance/evaluate", response_model=ScoreResponse, status_code=status.HTTP_201_CREATED)
async def evaluate_performance(data: EvaluateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    score = await performance_service.evaluate_performance(session, tid, data)
    await session.commit()
    return score

@router.get("/benchmarks", response_model=List[BenchmarkResponse])
async def list_benchmarks(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await performance_service.list_benchmarks(session, tid)

@router.get("/insights", response_model=List[InsightResponse])
async def list_insights(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await performance_service.list_insights(session, tid)
