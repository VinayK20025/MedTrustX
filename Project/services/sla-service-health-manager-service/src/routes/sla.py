"""
MedTrustX SLA & Service Health Manager Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.sla import EventResponse, HealthResponse, SlaCreate, SlaResponse, ViolationResponse
from src.services import sla_service

router = APIRouter(tags=["SLA & Service Health Manager Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/slas", response_model=SlaResponse, status_code=status.HTTP_201_CREATED)
async def create_sla(data: SlaCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    sla = await sla_service.create_sla(session, tid, data)
    await session.commit()
    return sla

@router.get("/slas/{id}", response_model=SlaResponse)
async def get_sla(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    sla = await sla_service.get_sla(session, tid, id)
    if not sla:
        raise HTTPException(status_code=404, detail="SLA not found")
    return sla

@router.get("/health/{service_name}", response_model=HealthResponse)
async def get_health(service_name: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    health = await sla_service.get_health(session, tid, service_name)
    if not health:
        raise HTTPException(status_code=404, detail="Health record not found")
    return health

@router.get("/violations", response_model=List[ViolationResponse])
async def list_violations(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await sla_service.list_violations(session, tid)

@router.get("/events", response_model=List[EventResponse])
async def list_events(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await sla_service.list_events(session, tid)
