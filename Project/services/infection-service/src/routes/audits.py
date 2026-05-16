"""
MedTrustX Infection Control Service — Audits Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.infection import InfectionAuditCreate, InfectionAuditResponse
from src.services import infection_service

router = APIRouter(prefix="/infection-audits", tags=["Audits"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "user_id", None)
    if raw is None:
        # Fallback for development if middleware isn't strictly enforcing
        return uuid.uuid4()
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid4()

@router.post(
    "/",
    response_model=InfectionAuditResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a hygiene or sterilization audit",
)
async def record_audit(
    data: InfectionAuditCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    audit = await infection_service.record_audit(session, tenant_id, user_id, data)
    await session.commit()
    return audit

@router.get(
    "/",
    response_model=List[InfectionAuditResponse],
    summary="List infection control audits",
)
async def list_audits(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await infection_service.get_audits(session, tenant_id)
