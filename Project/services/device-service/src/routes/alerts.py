"""
MedTrustX Devices & IoMT Service — Alerts Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.device import DeviceAlertCreate, DeviceAlertResponse
from src.services import device_service

router = APIRouter(prefix="/devices/{device_id}/alerts", tags=["Alerts"])

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
    response_model=DeviceAlertResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger a hardware or threshold alert from the device",
)
async def trigger_alert(
    device_id: uuid.UUID,
    data: DeviceAlertCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    alert = await device_service.trigger_alert(session, tenant_id, device_id, data)
    await session.commit()
    return alert

@router.post(
    "/{alert_id}/resolve",
    response_model=DeviceAlertResponse,
    summary="Resolve a previously triggered alert",
)
async def resolve_alert(
    device_id: uuid.UUID,
    alert_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    alert = await device_service.resolve_alert(session, tenant_id, device_id, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found or already resolved")
    await session.commit()
    return alert
