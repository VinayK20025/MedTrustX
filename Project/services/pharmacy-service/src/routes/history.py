"""
MedTrustX Pharmacy Service — Patient Medication History Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.pharmacy import PatientMedicationHistoryResponse
from src.services import pharmacy_service

router = APIRouter(prefix="/patients/{patient_id}/medications", tags=["Medication History"])

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
    response_model=PatientMedicationHistoryResponse,
    summary="Get patient medication history",
)
async def get_medication_history(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    prescriptions = await pharmacy_service.get_patient_medications(session, tenant_id, patient_id)
    return PatientMedicationHistoryResponse(
        patient_id=patient_id,
        tenant_id=tenant_id,
        prescriptions=prescriptions,
    )
