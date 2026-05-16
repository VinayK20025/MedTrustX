"""
Medications Router.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.db.session import get_clinical_session
from app.dependencies import get_redis
from app.services.prescription_engine import PrescriptionEngine
from app.models.medication import PrescriptionRequest, PrescriptionResult, MedicationRecord

router = APIRouter(prefix="/api/clinical/medications", tags=["medications"])

@router.post("", response_model=PrescriptionResult)
async def prescribe_medication(
    request: Request,
    payload: PrescriptionRequest,
    session: AsyncSession = Depends(get_clinical_session),
    redis = Depends(get_redis)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    engine = PrescriptionEngine(session, redis)
    
    result = await engine.prescribe(tenant_id, payload)
    return result

@router.get("/{patient_id}", response_model=List[MedicationRecord])
async def list_medications(
    patient_id: str,
    request: Request,
    status: str = "active",
    session: AsyncSession = Depends(get_clinical_session)
):
    tenant_id = getattr(request.state, "tenant_id", "default")
    from app.db.repositories.medication_repo import MedicationRepository
    repo = MedicationRepository(session)
    
    meds = await repo.get_patient_medications(tenant_id, patient_id, status)
    return [MedicationRecord(**m) for m in meds]
