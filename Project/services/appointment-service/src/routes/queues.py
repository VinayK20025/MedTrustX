"""
MedTrustX Appointments Service — Queues Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.appointments import QueueResponse
from src.services import appointment_service

router = APIRouter(prefix="/queues", tags=["Queues"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get(
    "/{doctor_id}",
    response_model=List[QueueResponse],
    summary="Get the live waitlist/queue for a specific doctor",
)
async def get_doctor_queue(
    doctor_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await appointment_service.get_doctor_queue(session, tenant_id, doctor_id)
