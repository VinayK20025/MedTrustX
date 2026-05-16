"""
MedTrustX Medical Records Service — Records Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.records import MedicalRecordCreate, MedicalRecordResponse, MedicalRecordUpdate
from src.services import records_service

router = APIRouter(tags=["Medical Records"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id(request: Request) -> uuid.UUID:
    user_id_str = getattr(request.state, "user_id", None) or request.headers.get("X-User-ID")
    if not user_id_str:
        return uuid.uuid4()
    return uuid.UUID(str(user_id_str))

@router.post(
    "/medical-records",
    response_model=MedicalRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new medical record metadata index",
)
async def create_record(
    data: MedicalRecordCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    record = await records_service.create_record(session, tenant_id, user_id, data)
    await session.commit()
    return record

@router.get(
    "/medical-records/{record_id}",
    response_model=MedicalRecordResponse,
    summary="Get medical record details and metadata",
)
async def get_record(
    record_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    record = await records_service.get_record(session, tenant_id, record_id, user_id)
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    await session.commit() # Commit audit log
    return record

@router.put(
    "/medical-records/{record_id}",
    response_model=MedicalRecordResponse,
    summary="Update medical record summary (bumps version)",
)
async def update_record(
    record_id: uuid.UUID,
    data: MedicalRecordUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    record = await records_service.update_record(session, tenant_id, record_id, user_id, data)
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    await session.commit()
    return record

@router.get(
    "/patients/{patient_id}/medical-records",
    response_model=List[MedicalRecordResponse],
    summary="Get full longitudinal medical timeline for a patient",
)
async def get_patient_timeline(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    timeline = await records_service.get_patient_timeline(session, tenant_id, patient_id, user_id)
    await session.commit()
    return timeline
