"""
MedTrustX Consent Service — Patients Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.consent import ConsentResponse
from src.services import consent_service

router = APIRouter(prefix="/patients", tags=["Patients"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get(
    "/{patient_id}/consents",
    response_model=List[ConsentResponse],
    summary="Get all consents for a patient",
)
async def get_patient_consents(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await consent_service.get_patient_consents(session, tenant_id, patient_id)
