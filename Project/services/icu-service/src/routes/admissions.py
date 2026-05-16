"""
MedTrustX ICU Service — Admissions Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.icu import ICUPatientCreate, ICUPatientResponse
from src.services import icu_service

router = APIRouter(prefix="/icu/admissions", tags=["ICU Admissions"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/",
    response_model=ICUPatientResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admit a patient to the ICU",
)
async def admit_patient(
    data: ICUPatientCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    patient = await icu_service.admit_patient(session, tenant_id, data)
    await session.commit()
    return patient

@router.get(
    "/{record_id}",
    response_model=ICUPatientResponse,
    summary="Get ICU admission record",
)
async def get_patient(
    record_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    patient = await icu_service.get_icu_patient(session, tenant_id, record_id)
    if not patient:
        raise HTTPException(status_code=404, detail="ICU record not found")
    return patient
