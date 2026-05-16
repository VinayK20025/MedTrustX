"""
MedTrustX Consent Service — Validate Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.consent import ValidationRequest, ValidationResponse
from src.services import consent_service

router = APIRouter(prefix="/consents", tags=["Validate"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/validate",
    response_model=ValidationResponse,
    summary="Validate patient consent for an action",
)
async def validate_consent(
    data: ValidationRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    val = await consent_service.validate_consent(session, tenant_id, data)
    await session.commit()
    return val
