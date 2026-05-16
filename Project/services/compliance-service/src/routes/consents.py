"""
MedTrustX Compliance Service — Consents Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.compliance import ConsentCreate, ConsentResponse, ConsentUpdate
from src.services import compliance_service

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
    summary="Record patient consent",
)
async def create_consent(
    data: ConsentCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    consent = await compliance_service.create_consent(session, tenant_id, data)
    await session.commit()
    return consent

@router.get(
    "/{consent_id}",
    response_model=ConsentResponse,
    summary="Get consent details",
)
async def get_consent(
    consent_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    consent = await compliance_service.get_consent(session, tenant_id, consent_id)
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    return consent

@router.put(
    "/{consent_id}",
    response_model=ConsentResponse,
    summary="Update or revoke consent",
)
async def update_consent(
    consent_id: uuid.UUID,
    data: ConsentUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    consent = await compliance_service.update_consent(session, tenant_id, consent_id, data)
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    await session.commit()
    return consent
