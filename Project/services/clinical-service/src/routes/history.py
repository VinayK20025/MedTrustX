"""
MedTrustX Clinical Service — Patient History Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.clinical import PatientHistoryResponse
from src.services import clinical_service

router = APIRouter(prefix="/patients/{patient_id}/clinical-history", tags=["Clinical History"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


@router.get(
    "/",
    response_model=PatientHistoryResponse,
    summary="Get patient clinical history",
    description="Retrieves the full longitudinal clinical history for a patient including all encounters, notes, diagnoses, and observations.",
)
async def get_clinical_history(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    encounters = await clinical_service.get_patient_history(session, tenant_id, patient_id)
    
    return PatientHistoryResponse(
        patient_id=patient_id,
        tenant_id=tenant_id,
        encounters=encounters,
    )
