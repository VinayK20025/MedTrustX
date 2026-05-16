"""
MedTrustX Analytics Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.analytics import (
    DashboardCreateRequest,
    DashboardResponse,
    EventIngestRequest,
    EventResponse,
    MetricResponse,
    PredictionResponse,
    ReportResponse,
)
from src.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Event Ingestion ──

@router.post(
    "/events",
    response_model=EventResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Ingest analytics event",
)
async def ingest_event(
    data: EventIngestRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    event = await analytics_service.ingest_event(session, tid, data)
    await session.commit()
    return event


# ── Metrics ──

@router.get(
    "/metrics",
    response_model=List[MetricResponse],
    summary="List aggregated metrics",
)
async def list_metrics(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    return await analytics_service.get_metrics(session, tid)


# ── Reports ──

@router.get(
    "/reports/{report_id}",
    response_model=ReportResponse,
    summary="Get report by ID",
)
async def get_report(
    report_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    report = await analytics_service.get_report(session, tid, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post(
    "/reports/generate",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate summary report",
)
async def generate_report(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    report = await analytics_service.generate_summary_report(session, tid)
    await session.commit()
    return report


# ── Predictions ──

@router.get(
    "/predictions/{entity_id}",
    response_model=PredictionResponse,
    summary="Get latest prediction for entity",
)
async def get_prediction(
    entity_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    pred = await analytics_service.get_prediction(session, tid, entity_id)
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return pred


@router.post(
    "/predictions/{entity_id}/run",
    response_model=PredictionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Run prediction for entity",
)
async def run_prediction(
    entity_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    pred = await analytics_service.run_prediction(session, tid, entity_id)
    await session.commit()
    return pred


# ── Dashboards ──

@router.post(
    "/dashboards",
    response_model=DashboardResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create dashboard",
)
async def create_dashboard(
    data: DashboardCreateRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    dash = await analytics_service.create_dashboard(session, tid, data)
    await session.commit()
    return dash


@router.get(
    "/dashboards/{dashboard_id}",
    response_model=DashboardResponse,
    summary="Get dashboard",
)
async def get_dashboard(
    dashboard_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    dash = await analytics_service.get_dashboard(session, tid, dashboard_id)
    if not dash:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return dash


@router.get(
    "/dashboards",
    response_model=List[DashboardResponse],
    summary="List dashboards",
)
async def list_dashboards(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tid = _get_tenant_id(request)
    return await analytics_service.list_dashboards(session, tid)
