"""
MedTrustX Clinical Service — Diagnosis Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.clinical import DiagnosisCreate, DiagnosisResponse
from src.services import clinical_service

router = APIRouter(prefix="/encounters/{encounter_id}/diagnoses", tags=["Diagnoses"])


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
    response_model=DiagnosisResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add diagnosis",
)
async def add_diagnosis(
    encounter_id: uuid.UUID,
    data: DiagnosisCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    
    diagnosis = await clinical_service.add_diagnosis(
        session, tenant_id, encounter_id, user_id, data
    )
    if not diagnosis:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    await session.commit()
    return diagnosis


@router.get(
    "/",
    response_model=List[DiagnosisResponse],
    summary="List diagnoses",
)
async def list_diagnoses(
    encounter_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await clinical_service.list_diagnoses(session, tenant_id, encounter_id)
