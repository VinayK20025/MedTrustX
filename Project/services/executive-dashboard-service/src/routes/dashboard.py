"""
MedTrustX Executive Dashboard Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.dashboard import AccessLogResponse, DashboardCreate, DashboardResponse, KPIResponse, WidgetResponse
from src.services import dashboard_service

router = APIRouter(tags=["Executive Dashboard Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id(request: Request) -> uuid.UUID:
    raw = request.headers.get("X-User-ID", "00000000-0000-0000-0000-000000000000")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.UUID("00000000-0000-0000-0000-000000000000")

@router.post("/dashboards", response_model=DashboardResponse, status_code=status.HTTP_201_CREATED)
async def create_dashboard(data: DashboardCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    dash = await dashboard_service.create_dashboard(session, tid, data)
    await session.commit()
    return dash

@router.get("/dashboards/{id}", response_model=DashboardResponse)
async def get_dashboard(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    uid = _get_user_id(request)
    dash = await dashboard_service.get_dashboard(session, tid, id, uid)
    if not dash:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    await session.commit() # Commit the access log
    return dash

@router.get("/kpis", response_model=List[KPIResponse])
async def list_kpis(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await dashboard_service.list_kpis(session, tid)

@router.get("/widgets", response_model=List[WidgetResponse])
async def list_widgets(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await dashboard_service.list_widgets(session, tid)

@router.get("/access-logs", response_model=List[AccessLogResponse])
async def list_access_logs(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await dashboard_service.list_access_logs(session, tid)
