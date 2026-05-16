"""
MedTrustX Consent Service — Consents Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.consent import ConsentCreate, ConsentUpdate, ConsentResponse, ConsentLogResponse
from src.services import consent_service

router = APIRouter(prefix="/consents", tags=["Consents"])

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
    response_model=ConsentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Capture patient consent",
)
async def create_consent(
    data: ConsentCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    consent = await consent_service.create_consent(session, tenant_id, data)
    await session.commit()
    return consent

@router.get(
    "/{consent_id}",
    response_model=ConsentResponse,
    summary="Get a consent record",
)
async def get_consent(
    consent_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    consent = await consent_service.get_consent(session, tenant_id, consent_id)
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    return consent

@router.put(
    "/{consent_id}",
    response_model=ConsentResponse,
    summary="Update a consent record",
)
async def update_consent(
    consent_id: uuid.UUID,
    data: ConsentUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    consent = await consent_service.update_consent(session, tenant_id, consent_id, data)
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    await session.commit()
    return consent

class RevokeRequest(BaseModel):
    performed_by: uuid.UUID

@router.post(
    "/{consent_id}/revoke",
    response_model=ConsentResponse,
    summary="Revoke a consent",
)
async def revoke_consent(
    consent_id: uuid.UUID,
    data: RevokeRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    consent = await consent_service.revoke_consent(session, tenant_id, consent_id, data.performed_by)
    if not consent:
        raise HTTPException(status_code=400, detail="Consent not found or already revoked")
    await session.commit()
    return consent

@router.get(
    "/{consent_id}/logs",
    response_model=List[ConsentLogResponse],
    summary="Get logs for a consent",
)
async def get_consent_logs(
    consent_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await consent_service.get_consent_logs(session, tenant_id, consent_id)
