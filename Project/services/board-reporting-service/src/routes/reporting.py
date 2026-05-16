"""
MedTrustX Board Reporting Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.reporting import DistributionResponse, ReportCreate, ReportResponse, ScheduleResponse
from src.services import reporting_service

router = APIRouter(tags=["Board Reporting Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report(data: ReportCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    report = await reporting_service.create_report(session, tid, data)
    await session.commit()
    return report

@router.get("/reports/{id}", response_model=ReportResponse)
async def get_report(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    report = await reporting_service.get_report(session, tid, id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.post("/reports/{id}/generate", response_model=ReportResponse)
async def generate_report(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    report = await reporting_service.generate_report(session, tid, id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    await session.commit()
    return report

@router.get("/schedules", response_model=List[ScheduleResponse])
async def list_schedules(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await reporting_service.list_schedules(session, tid)

@router.get("/distribution", response_model=List[DistributionResponse])
async def list_distribution(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await reporting_service.list_distribution(session, tid)
