"""
MedTrustX Alert Correlation Engine Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.correlation import (
    AlertCreate, AlertResponse, CorrelatedIncidentResponse,
    SuppressionRuleCreate, SuppressionRuleResponse
)
from src.services import correlation_service

router = APIRouter(tags=["Alert Correlation Engine Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Alerts ──

@router.post("/alerts", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def ingest_alert(data: AlertCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    alert = await correlation_service.ingest_alert(session, tid, data)
    await session.commit()
    return alert


@router.get("/alerts/{id}", response_model=AlertResponse)
async def get_alert(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    alert = await correlation_service.get_alert(session, tid, id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


# ── Incidents ──

@router.get("/incidents", response_model=List[CorrelatedIncidentResponse])
async def list_incidents(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await correlation_service.list_incidents(session, tid)


@router.get("/incidents/{id}", response_model=CorrelatedIncidentResponse)
async def get_incident(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    incident = await correlation_service.get_incident(session, tid, id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


# ── Suppression Rules ──

@router.post("/rules", response_model=SuppressionRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_rule(data: SuppressionRuleCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    rule = await correlation_service.create_rule(session, tid, data)
    await session.commit()
    return rule
