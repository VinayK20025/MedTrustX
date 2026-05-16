"""
MedTrustX Compliance Service — Compliance Checks Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.compliance import ComplianceCheckCreate, ComplianceCheckResponse
from src.services import compliance_service

router = APIRouter(prefix="/compliance-checks", tags=["Compliance Checks"])

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
    response_model=ComplianceCheckResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a compliance check",
)
async def create_compliance_check(
    data: ComplianceCheckCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    check = await compliance_service.create_check(session, tenant_id, data)
    await session.commit()
    return check

@router.get(
    "/{check_id}",
    response_model=ComplianceCheckResponse,
    summary="Get compliance check details",
)
async def get_compliance_check(
    check_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    check = await compliance_service.get_check(session, tenant_id, check_id)
    if not check:
        raise HTTPException(status_code=404, detail="Compliance check not found")
    return check
