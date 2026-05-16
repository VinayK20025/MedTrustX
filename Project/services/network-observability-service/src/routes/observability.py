"""
MedTrustX Network Observability Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.net_observability import AnomalyResponse, DependencyResponse, FlowResponse, MetricResponse
from src.services import observability_service

router = APIRouter(tags=["Network Observability Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get("/flows", response_model=List[FlowResponse])
async def list_flows(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await observability_service.list_flows(session, tid)

@router.get("/metrics", response_model=List[MetricResponse])
async def list_metrics(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await observability_service.list_metrics(session, tid)

@router.get("/dependencies", response_model=List[DependencyResponse])
async def list_dependencies(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await observability_service.list_dependencies(session, tid)

@router.get("/anomalies", response_model=List[AnomalyResponse])
async def list_anomalies(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await observability_service.list_anomalies(session, tid)
