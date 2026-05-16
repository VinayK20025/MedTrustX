"""
MedTrustX Legal Risk Analytics Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.risk import ModelResponse, RiskEvaluateRequest, RiskScoreResponse, TrendResponse
from src.services import risk_service

router = APIRouter(tags=["Legal Risk Analytics Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get("/risk/{case_id}", response_model=RiskScoreResponse)
async def get_risk(case_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    score = await risk_service.get_risk(session, tid, case_id)
    if not score:
        raise HTTPException(status_code=404, detail="Risk score not found")
    return score

@router.post("/risk/evaluate", response_model=RiskScoreResponse, status_code=status.HTTP_201_CREATED)
async def evaluate_risk(data: RiskEvaluateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    score = await risk_service.evaluate_risk(session, tid, data)
    await session.commit()
    return score

@router.get("/trends", response_model=List[TrendResponse])
async def list_trends(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await risk_service.list_trends(session, tid)

@router.get("/models", response_model=List[ModelResponse])
async def list_models(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await risk_service.list_models(session, tid)
