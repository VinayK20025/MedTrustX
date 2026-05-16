"""
MedTrustX Enterprise Risk Oversight Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.risk import (
    AssessmentCreate, AssessmentResponse, MitigationResponse,
    RiskCreate, RiskEventResponse, RiskResponse,
)
from src.services import risk_service

router = APIRouter(tags=["Enterprise Risk Oversight Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/risks", response_model=RiskResponse, status_code=status.HTTP_201_CREATED)
async def create_risk(data: RiskCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    risk = await risk_service.create_risk(session, tid, data)
    await session.commit()
    return risk

@router.get("/risks/{id}", response_model=RiskResponse)
async def get_risk(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    risk = await risk_service.get_risk(session, tid, id)
    if not risk:
        raise HTTPException(status_code=404, detail="Risk not found")
    return risk

@router.post("/assessments", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(data: AssessmentCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    assessment = await risk_service.create_assessment(session, tid, data)
    await session.commit()
    return assessment

@router.get("/mitigation", response_model=List[MitigationResponse])
async def list_mitigation(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await risk_service.list_mitigation(session, tid)

@router.get("/events", response_model=List[RiskEventResponse])
async def list_events(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await risk_service.list_events(session, tid)
