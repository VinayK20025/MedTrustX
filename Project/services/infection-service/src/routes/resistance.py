"""
MedTrustX Infection Control Service — Resistance Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.infection import AMRCreate, AMRResponse
from src.services import infection_service

router = APIRouter(tags=["Antimicrobial Resistance"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/resistance",
    response_model=AMRResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record antimicrobial resistance data",
)
async def record_resistance(
    data: AMRCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    amr = await infection_service.record_resistance(session, tenant_id, data)
    await session.commit()
    return amr

@router.get(
    "/patients/{patient_id}/resistance",
    response_model=List[AMRResponse],
    summary="Get AMR profile for a patient",
)
async def get_patient_resistance(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await infection_service.get_patient_resistance(session, tenant_id, patient_id)
