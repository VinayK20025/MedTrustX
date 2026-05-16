"""
MedTrustX Devices & IoMT Service — Telemetry Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.device import TelemetryBatchRequest
from src.services import device_service

router = APIRouter(prefix="/devices/{device_id}/telemetry", tags=["Telemetry"])

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
    status_code=status.HTTP_202_ACCEPTED,
    summary="Ingest high-frequency telemetry batch",
)
async def ingest_telemetry(
    device_id: uuid.UUID,
    data: TelemetryBatchRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    
    # Highly optimized endpoint: insert to DB + Kafka stream
    count = await device_service.ingest_telemetry(session, tenant_id, device_id, data)
    await session.commit()
    
    return {"status": "accepted", "processed": count}
