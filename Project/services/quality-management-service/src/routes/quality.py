"""
MedTrustX Quality Management Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.quality import (
    AuditCreate, AuditResponse,
    ImprovementPlanCreate, ImprovementPlanResponse,
    IncidentCreate, IncidentResponse,
    QualityMetricCreate, QualityMetricResponse,
    RCACreate, RCAResponse
)
from src.services import quality_service

router = APIRouter(tags=["Quality Management"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Metrics ──

@router.post("/quality/metrics", response_model=QualityMetricResponse, status_code=status.HTTP_201_CREATED)
async def record_metric(data: QualityMetricCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    metric = await quality_service.record_metric(session, tid, data)
    await session.commit()
    return metric

@router.get("/quality/metrics", response_model=List[QualityMetricResponse])
async def get_metrics(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await quality_service.get_metrics(session, tid)


# ── Incidents & RCA ──

@router.post("/incidents", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def report_incident(data: IncidentCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    incident = await quality_service.report_incident(session, tid, data)
    await session.commit()
    return incident

@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    incident = await quality_service.get_incident(session, tid, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("/incidents/{incident_id}/rca", response_model=RCAResponse)
async def submit_rca(incident_id: uuid.UUID, data: RCACreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    try:
        rca = await quality_service.submit_rca(session, tid, incident_id, data)
        await session.commit()
        return rca
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# ── Audits & Plans ──

@router.post("/audits", response_model=AuditResponse, status_code=status.HTTP_201_CREATED)
async def create_audit(data: AuditCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    audit = await quality_service.create_audit(session, tid, data)
    await session.commit()
    return audit

@router.get("/audits/{audit_id}", response_model=AuditResponse)
async def get_audit(audit_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    audit = await quality_service.get_audit(session, tid, audit_id)
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit

@router.post("/improvement-plans", response_model=ImprovementPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_improvement_plan(data: ImprovementPlanCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    plan = await quality_service.create_improvement_plan(session, tid, data)
    await session.commit()
    return plan
