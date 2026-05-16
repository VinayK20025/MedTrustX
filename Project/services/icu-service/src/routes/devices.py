"""
MedTrustX ICU Service — Device Telemetry Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.icu import DeviceDataCreate, DeviceDataResponse
from src.services import icu_service

router = APIRouter(prefix="/icu/device-data", tags=["Devices"])

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
    response_model=DeviceDataResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest raw telemetry payload from IoMT devices",
)
async def ingest_device_data(
    data: DeviceDataCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    device_record = await icu_service.ingest_device_data(session, tenant_id, data)
    await session.commit()
    return device_record
