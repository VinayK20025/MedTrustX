"""
MedTrustX Compliance Enforcement Service — Violations Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.enforcement import ComplianceViolationResponse
from src.services import enforcement_service

router = APIRouter(prefix="/compliance/violations", tags=["Compliance Violations"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get(
    "/",
    response_model=List[ComplianceViolationResponse],
    summary="Get all violations",
)
async def get_compliance_violations(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await enforcement_service.get_violations(session, tenant_id)

@router.get(
    "/{violation_id}",
    response_model=ComplianceViolationResponse,
    summary="Get violation details",
)
async def get_compliance_violation(
    violation_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    violation = await enforcement_service.get_violation(session, tenant_id, violation_id)
    if not violation:
        raise HTTPException(status_code=404, detail="Compliance violation not found")
    return violation
