"""
MedTrustX Pharmacy Service — Prescription Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.pharmacy import (
    PrescriptionCreate,
    PrescriptionDetailResponse,
    PrescriptionResponse,
    PrescriptionUpdate,
)
from src.services import pharmacy_service

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

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
    response_model=PrescriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new prescription",
)
async def create_prescription(
    data: PrescriptionCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    try:
        prescription = await pharmacy_service.create_prescription(session, tenant_id, user_id, data)
        await session.commit()
        return prescription
    except Exception as exc:
        await session.rollback()
        raise HTTPException(status_code=422, detail=str(exc))

@router.get(
    "/{prescription_id}",
    response_model=PrescriptionDetailResponse,
    summary="Get prescription details",
)
async def get_prescription(
    prescription_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    prescription = await pharmacy_service.get_prescription(session, tenant_id, prescription_id, load_relations=True)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription

@router.put(
    "/{prescription_id}",
    response_model=PrescriptionResponse,
    summary="Update prescription status",
)
async def update_prescription(
    prescription_id: uuid.UUID,
    data: PrescriptionUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    prescription = await pharmacy_service.update_prescription(session, tenant_id, prescription_id, data)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    await session.commit()
    return prescription
