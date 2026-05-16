"""
MedTrustX Nursing Service — Nursing Notes Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.nursing import NursingNoteCreate, NursingNoteResponse
from src.services import nursing_service

router = APIRouter(prefix="/patients/{patient_id}/nursing-notes", tags=["Nursing Notes"])

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
    "/",
    response_model=NursingNoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add nursing note",
)
async def add_note(
    patient_id: uuid.UUID,
    data: NursingNoteCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    if str(data.patient_id) != str(patient_id):
        raise HTTPException(status_code=400, detail="Patient ID mismatch")
        
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    note = await nursing_service.add_nursing_note(session, tenant_id, user_id, data)
    await session.commit()
    return note

@router.get(
    "/",
    response_model=List[NursingNoteResponse],
    summary="Get patient nursing notes",
)
async def get_notes(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await nursing_service.get_patient_notes(session, tenant_id, patient_id)
