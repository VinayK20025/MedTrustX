"""
MedTrustX IoT Messaging Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.iot import (
    DeviceCommandCreate, DeviceCommandResponse,
    DeviceConnectionCreate, DeviceConnectionResponse,
    DeviceEventResponse,
    MessageLogResponse,
    MqttTopicResponse
)
from src.services import iot_service

router = APIRouter(tags=["IoT Messaging Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Connections ──

@router.post("/devices/connect", response_model=DeviceConnectionResponse, status_code=status.HTTP_201_CREATED)
async def connect_device(data: DeviceConnectionCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    connection = await iot_service.connect_device(session, tid, data)
    await session.commit()
    return connection


# ── Topics ──

@router.get("/topics", response_model=List[MqttTopicResponse])
async def get_topics(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await iot_service.get_topics(session, tid)


# ── Messages ──

@router.get("/devices/{device_id}/messages", response_model=List[MessageLogResponse])
async def get_device_messages(device_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await iot_service.get_device_messages(session, tid, device_id)


# ── Commands ──

@router.post("/devices/{device_id}/command", response_model=DeviceCommandResponse, status_code=status.HTTP_201_CREATED)
async def send_command(device_id: uuid.UUID, data: DeviceCommandCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    command = await iot_service.send_command(session, tid, device_id, data)
    await session.commit()
    return command


# ── Events ──

@router.get("/devices/{device_id}/events", response_model=List[DeviceEventResponse])
async def get_device_events(device_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await iot_service.get_device_events(session, tid, device_id)
