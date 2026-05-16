"""
MedTrustX Appointments Service — Appointments Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.appointments import AppointmentCreate, AppointmentResponse, AppointmentUpdate
from src.services import appointment_service

router = APIRouter(tags=["Appointments"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/appointments",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Book a new appointment, locking the requested slot",
)
async def create_appointment(
    data: AppointmentCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        appt = await appointment_service.book_appointment(session, tenant_id, data)
        await session.commit()
        return appt
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e)) # 409 Conflict

@router.get(
    "/appointments/{appointment_id}",
    response_model=AppointmentResponse,
    summary="Get appointment details",
)
async def get_appointment(
    appointment_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    appt = await appointment_service.get_appointment(session, tenant_id, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt

@router.put(
    "/appointments/{appointment_id}",
    response_model=AppointmentResponse,
    summary="Update appointment status (e.g. check-in, cancel)",
)
async def update_appointment(
    appointment_id: uuid.UUID,
    data: AppointmentUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    appt = await appointment_service.update_appointment_status(session, tenant_id, appointment_id, data)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    await session.commit()
    return appt

@router.delete(
    "/appointments/{appointment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete/Cancel an appointment",
)
async def delete_appointment(
    appointment_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    success = await appointment_service.delete_appointment(session, tenant_id, appointment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Appointment not found")
    await session.commit()
    return None

@router.get(
    "/patients/{patient_id}/appointments",
    response_model=List[AppointmentResponse],
    summary="Get all appointments for a patient",
)
async def get_patient_appointments(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await appointment_service.get_patient_appointments(session, tenant_id, patient_id)
