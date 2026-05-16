"""
MedTrustX ClickHouse Analytics Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.clickhouse import (
    AnalyticsEventResponse, EventIngestRequest, EventIngestResponse, MetricSummaryResponse
)
from src.services import analytics_service

router = APIRouter(tags=["ClickHouse Analytics Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Ingestion ──

@router.post("/analytics/ingest", response_model=EventIngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_event(data: EventIngestRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    result = await analytics_service.ingest_event(session, tid, data)
    await session.commit()
    return result


# ── Queries ──

@router.get("/analytics/events", response_model=List[AnalyticsEventResponse])
async def get_recent_events(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await analytics_service.get_recent_events(session, tid)


@router.get("/analytics/metrics", response_model=MetricSummaryResponse)
async def get_metrics_summary(metric_name: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await analytics_service.get_metrics_summary(session, tid, metric_name)
