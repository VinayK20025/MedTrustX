"""
Appointments Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.session import get_db_session
from app.dependencies import get_redis
from app.services.scheduling_engine import SchedulingEngine
from app.models.appointment import AppointmentCreateRequest, AppointmentUpdateRequest, AppointmentRecord

router = APIRouter(prefix="/api/appointments", tags=["appointments"])

@router.post("", response_model=AppointmentRecord)
async def schedule_appointment(
    request: Request,
    payload: AppointmentCreateRequest,
    session: AsyncSession = Depends(get_db_session),
    redis = Depends(get_redis)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    engine = SchedulingEngine(session, redis)
    
    try:
        appointment = await engine.schedule(tenant_id, payload)
        return AppointmentRecord(**appointment)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.delete("/{appointment_id}")
async def cancel_appointment(
    appointment_id: str,
    request: Request,
    reason: str = "Patient requested",
    session: AsyncSession = Depends(get_db_session),
    redis = Depends(get_redis)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    engine = SchedulingEngine(session, redis)
    
    appointment = await engine.cancel(tenant_id, appointment_id, reason)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    return {"status": "cancelled", "appointment_id": appointment_id}

@router.get("/patient/{patient_id}", response_model=List[AppointmentRecord])
async def list_patient_appointments(
    patient_id: str,
    request: Request,
    session: AsyncSession = Depends(get_db_session),
    redis = Depends(get_redis)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    engine = SchedulingEngine(session, redis)
    
    appointments = await engine.list_for_patient(tenant_id, patient_id)
    return [AppointmentRecord(**a) for a in appointments]
