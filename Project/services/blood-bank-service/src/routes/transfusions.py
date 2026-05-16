"""
MedTrustX Blood Bank Service — Transfusion Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.blood_bank import TransfusionCreate, TransfusionResponse, TransfusionUpdate
from src.services import blood_bank_service

router = APIRouter(tags=["Transfusions"])

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
    "/transfusions",
    response_model=TransfusionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record start of a transfusion",
)
async def record_transfusion(
    data: TransfusionCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    transfusion = await blood_bank_service.record_transfusion(session, tenant_id, user_id, data)
    await session.commit()
    return transfusion

@router.put(
    "/transfusions/{transfusion_id}",
    response_model=TransfusionResponse,
    summary="Update transfusion status",
)
async def update_transfusion(
    transfusion_id: uuid.UUID,
    data: TransfusionUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    transfusion = await blood_bank_service.update_transfusion(session, tenant_id, transfusion_id, data)
    if not transfusion:
        raise HTTPException(status_code=404, detail="Transfusion not found")
    await session.commit()
    return transfusion

@router.get(
    "/patients/{patient_id}/transfusions",
    response_model=List[TransfusionResponse],
    summary="Get patient transfusion history",
)
async def get_patient_transfusions(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await blood_bank_service.get_patient_transfusions(session, tenant_id, patient_id)
