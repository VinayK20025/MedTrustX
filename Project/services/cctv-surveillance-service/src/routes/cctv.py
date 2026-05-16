"""
MedTrustX CCTV & Surveillance Service — API Routes
"""
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session
from src.schemas.cctv import CameraCreate, CameraResponse, EventResponse, RecordingResponse, StreamResponse
from src.services import cctv_service

router = APIRouter(tags=["CCTV & Surveillance Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post("/cameras", response_model=CameraResponse, status_code=status.HTTP_201_CREATED)
async def create_camera(data: CameraCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    c = await cctv_service.create_camera(session, tid, data)
    await session.commit()
    return c

@router.get("/cameras/{id}", response_model=CameraResponse)
async def get_camera(id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    c = await cctv_service.get_camera(session, tid, id)
    if not c:
        raise HTTPException(status_code=404, detail="Camera not found")
    return c

@router.get("/streams/{camera_id}", response_model=StreamResponse)
async def get_stream(camera_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    s = await cctv_service.get_stream_by_camera(session, tid, camera_id)
    if not s:
        raise HTTPException(status_code=404, detail="Active stream not found for camera")
    return s

@router.get("/recordings", response_model=List[RecordingResponse])
async def list_recordings(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await cctv_service.list_recordings(session, tid)

@router.get("/events", response_model=List[EventResponse])
async def list_events(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await cctv_service.list_events(session, tid)
