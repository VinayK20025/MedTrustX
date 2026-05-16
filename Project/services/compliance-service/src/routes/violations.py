"""
MedTrustX Compliance Service — Violations Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.compliance import ViolationCreate, ViolationResponse
from src.services import compliance_service

router = APIRouter(prefix="/violations", tags=["Violations"])

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
    response_model=ViolationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Report a compliance violation",
)
async def report_violation(
    data: ViolationCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    violation = await compliance_service.create_violation(session, tenant_id, data)
    await session.commit()
    return violation

@router.get(
    "/{violation_id}",
    response_model=ViolationResponse,
    summary="Get violation details",
)
async def get_violation(
    violation_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    violation = await compliance_service.get_violation(session, tenant_id, violation_id)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return violation
