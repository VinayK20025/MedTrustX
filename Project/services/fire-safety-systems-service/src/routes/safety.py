"""
MedTrustX Fire & Safety Systems Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.safety import ActionCreate, ActionResponse, DeviceCreate, DeviceResponse, EvacuationResponse, EventResponse
from src.services import safety_service

router = APIRouter(tags=["Fire & Safety Systems Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/devices", response_model=DeviceResponse, status_code=status.HTTP_201_CREATED)
async def create_device(data: DeviceCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    dev = await safety_service.create_device(session, tid, data)
    await session.commit()
    return dev

@router.get("/devices/{id}", response_model=DeviceResponse)
async def get_device(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    dev = await safety_service.get_device(session, tid, id)
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found")
    return dev

@router.get("/events", response_model=List[EventResponse])
async def list_events(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await safety_service.list_events(session, tid)

@router.post("/actions/trigger", response_model=ActionResponse, status_code=status.HTTP_201_CREATED)
async def trigger_action(data: ActionCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    act = await safety_service.trigger_action(session, tid, data)
    await session.commit()
    return act

@router.get("/evacuations", response_model=List[EvacuationResponse])
async def list_evacuations(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await safety_service.list_evacuations(session, tid)
