"""
MedTrustX Perimeter Security Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.perimeter import EventResponse, ResponseActionResponse, ResponseCreate, SensorCreate, SensorResponse, ZoneCreate, ZoneResponse
from src.services import perimeter_service

router = APIRouter(tags=["Perimeter Security Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/zones", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED)
async def create_zone(data: ZoneCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    zn = await perimeter_service.create_zone(session, tid, data)
    await session.commit()
    return zn

@router.post("/sensors", response_model=SensorResponse, status_code=status.HTTP_201_CREATED)
async def create_sensor(data: SensorCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    sen = await perimeter_service.create_sensor(session, tid, data)
    await session.commit()
    return sen

@router.get("/zones/{id}", response_model=ZoneResponse)
async def get_zone(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    zn = await perimeter_service.get_zone(session, tid, id)
    if not zn:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zn

@router.get("/events", response_model=List[EventResponse])
async def list_events(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await perimeter_service.list_events(session, tid)

@router.post("/responses", response_model=ResponseActionResponse, status_code=status.HTTP_201_CREATED)
async def trigger_response(data: ResponseCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    act = await perimeter_service.trigger_response(session, tid, data)
    await session.commit()
    return act
