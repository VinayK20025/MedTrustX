"""
MedTrustX Appointments Service — Slots Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.appointments import SlotCreate, SlotResponse
from src.services import appointment_service

router = APIRouter(tags=["Slots"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get(
    "/doctors/{doctor_id}/slots",
    response_model=List[SlotResponse],
    summary="List all available upcoming slots for a doctor",
)
async def get_slots(
    doctor_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await appointment_service.get_doctor_slots(session, tenant_id, doctor_id)

@router.post(
    "/slots",
    response_model=SlotResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Instantiate a discrete bookable slot (usually done by background worker)",
)
async def create_slot(
    data: SlotCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    slot = await appointment_service.create_slot(session, tenant_id, data)
    await session.commit()
    return slot
