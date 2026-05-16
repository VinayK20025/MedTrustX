"""
MedTrustX Nursing Service — Vitals Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.nursing import VitalsCreate, VitalsResponse
from src.services import nursing_service

router = APIRouter(prefix="/patients/{patient_id}/vitals", tags=["Vitals"])

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
    response_model=VitalsResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record vitals",
)
async def record_vitals(
    patient_id: uuid.UUID,
    data: VitalsCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    vitals = await nursing_service.record_vitals(session, tenant_id, patient_id, user_id, data)
    await session.commit()
    return vitals

@router.get(
    "/",
    response_model=List[VitalsResponse],
    summary="Get patient vitals history",
)
async def get_vitals(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await nursing_service.get_patient_vitals(session, tenant_id, patient_id)
