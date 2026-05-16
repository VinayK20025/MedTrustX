"""
MedTrustX Risk Management Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.risk import (
    MitigationPlanCreate, MitigationPlanResponse,
    RiskAssessmentCreate, RiskAssessmentResponse,
    RiskCreate, RiskIndicatorResponse, RiskResponse
)
from src.services import risk_service

router = APIRouter(tags=["Risk Management Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Risks ──

@router.post("/risks", response_model=RiskResponse, status_code=status.HTTP_201_CREATED)
async def create_risk(data: RiskCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    risk = await risk_service.create_risk(session, tid, data)
    await session.commit()
    return risk

@router.get("/risks/high", response_model=List[RiskResponse])
async def get_high_risks(request: Request, threshold: int = 15, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await risk_service.get_high_risks(session, tid, threshold)

@router.get("/risks/{risk_id}", response_model=RiskResponse)
async def get_risk(risk_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    risk = await risk_service.get_risk(session, tid, risk_id)
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    return risk


# ── Assessments ──

@router.post("/risks/{risk_id}/assessments", response_model=RiskAssessmentResponse)
async def assess_risk(risk_id: uuid.UUID, data: RiskAssessmentCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    assessment = await risk_service.assess_risk(session, tid, risk_id, data)
    await session.commit()
    return assessment


# ── Mitigations ──

@router.post("/mitigation-plans", response_model=MitigationPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_mitigation_plan(data: MitigationPlanCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    plan = await risk_service.create_mitigation_plan(session, tid, data)
    await session.commit()
    return plan

@router.get("/mitigation-plans/{plan_id}", response_model=MitigationPlanResponse)
async def get_mitigation_plan(plan_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    plan = await risk_service.get_mitigation_plan(session, tid, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Mitigation plan not found")
    return plan


# ── Indicators ──

@router.get("/risk-indicators", response_model=List[RiskIndicatorResponse])
async def get_risk_indicators(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await risk_service.get_risk_indicators(session, tid)
