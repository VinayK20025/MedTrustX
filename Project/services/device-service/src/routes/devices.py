"""
MedTrustX Devices & IoMT Service — Devices Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.device import DeviceCreate, DeviceResponse, DeviceUpdate
from src.services import device_service

router = APIRouter(prefix="/devices", tags=["Devices"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/",
    response_model=DeviceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new medical device in the registry",
)
async def register_device(
    data: DeviceCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    device = await device_service.register_device(session, tenant_id, data)
    await session.commit()
    return device

@router.get(
    "/{device_id}",
    response_model=DeviceResponse,
    summary="Get device metadata",
)
async def get_device(
    device_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    device = await device_service.get_device(session, tenant_id, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

@router.put(
    "/{device_id}",
    response_model=DeviceResponse,
    summary="Update device operational status",
)
async def update_device(
    device_id: uuid.UUID,
    data: DeviceUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    device = await device_service.update_device_status(session, tenant_id, device_id, data)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    await session.commit()
    return device
