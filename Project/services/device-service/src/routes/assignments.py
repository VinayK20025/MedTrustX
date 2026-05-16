"""
MedTrustX Devices & IoMT Service — Assignment Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.device import DeviceAssignRequest, DeviceAssignmentResponse
from src.services import device_service

router = APIRouter(prefix="/devices/{device_id}", tags=["Assignments"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/assign",
    response_model=DeviceAssignmentResponse,
    summary="Assign a device to a patient",
)
async def assign_device(
    device_id: uuid.UUID,
    data: DeviceAssignRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        assignment = await device_service.assign_device(session, tenant_id, device_id, data)
        await session.commit()
        return assignment
    except ValueError as ve:
        raise HTTPException(status_code=409, detail=str(ve))

@router.post(
    "/unassign",
    response_model=DeviceAssignmentResponse,
    summary="Unassign the device from its current patient",
)
async def unassign_device(
    device_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    assignment = await device_service.unassign_device(session, tenant_id, device_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Device is not currently assigned")
    await session.commit()
    return assignment
