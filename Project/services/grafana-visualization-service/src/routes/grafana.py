"""
MedTrustX Grafana Visualization Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.grafana import (
    AlertVisualizationResponse, DashboardCreate, DashboardResponse,
    DataSourceResponse, PanelCreate, PanelResponse
)
from src.services import visualization_service

router = APIRouter(tags=["Grafana Visualization Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Dashboards ──

@router.post("/dashboards", response_model=DashboardResponse, status_code=status.HTTP_201_CREATED)
async def create_dashboard(data: DashboardCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    dash = await visualization_service.create_dashboard(session, tid, data)
    await session.commit()
    return dash


@router.get("/dashboards/{id}", response_model=DashboardResponse)
async def get_dashboard(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    dash = await visualization_service.get_dashboard(session, tid, id)
    if not dash:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return dash


# ── Panels ──

@router.post("/panels", response_model=PanelResponse, status_code=status.HTTP_201_CREATED)
async def create_panel(data: PanelCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    panel = await visualization_service.create_panel(session, tid, data)
    await session.commit()
    return panel


# ── Data Sources ──

@router.get("/datasources", response_model=List[DataSourceResponse])
async def get_datasources(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await visualization_service.get_datasources(session, tid)


# ── Alerts ──

@router.get("/alerts", response_model=List[AlertVisualizationResponse])
async def get_alert_visualizations(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await visualization_service.get_alert_visualizations(session, tid)
