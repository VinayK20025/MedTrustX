"""
MedTrustX Network Management Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.network import DeviceResponse, FaultResponse, MetricResponse, TopologyResponse
from src.services import management_service

router = APIRouter(tags=["Network Management Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get("/devices", response_model=List[DeviceResponse])
async def list_devices(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await management_service.list_devices(session, tid)

@router.get("/devices/{id}", response_model=DeviceResponse)
async def get_device(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    dev = await management_service.get_device(session, tid, id)
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")
    return dev

@router.get("/metrics", response_model=List[MetricResponse])
async def list_metrics(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await management_service.list_metrics(session, tid)

@router.get("/topology", response_model=List[TopologyResponse])
async def get_topology(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await management_service.get_topology(session, tid)

@router.get("/faults", response_model=List[FaultResponse])
async def list_faults(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await management_service.list_faults(session, tid)
