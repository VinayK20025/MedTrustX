"""
MedTrustX Prometheus Monitoring Service — API Routes
"""
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.prometheus import (
    AlertEventResponse, AlertRuleCreate, AlertRuleResponse,
    MetricSeriesResponse, TargetResponse
)
from src.services import monitoring_service

router = APIRouter(tags=["Prometheus Monitoring Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Metrics ──

@router.get("/metrics", response_model=List[MetricSeriesResponse])
async def get_metrics(
    request: Request,
    metric_name: Optional[str] = Query(None),
    limit: int = Query(50, le=1000),
    session: AsyncSession = Depends(get_session)
):
    tid = _get_tenant_id(request)
    return await monitoring_service.get_metrics(session, tid, metric_name, limit)


# ── Alerts ──

@router.post("/alerts/rules", response_model=AlertRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_alert_rule(data: AlertRuleCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    rule = await monitoring_service.create_alert_rule(session, tid, data)
    await session.commit()
    return rule


@router.get("/alerts", response_model=List[AlertEventResponse])
async def get_active_alerts(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await monitoring_service.get_active_alerts(session, tid)


# ── Targets ──

@router.get("/targets", response_model=List[TargetResponse])
async def get_targets(request: Request):
    tid = _get_tenant_id(request)
    return await monitoring_service.get_targets(tid)
