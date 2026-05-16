"""
MedTrustX Compliance Enforcement Service — Actions Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.enforcement import ComplianceActionCreate, ComplianceActionResponse
from src.services import enforcement_service

router = APIRouter(prefix="/compliance/actions", tags=["Compliance Actions"])

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
    response_model=ComplianceActionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a compliance action against a violation",
)
async def execute_action(
    data: ComplianceActionCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    action = await enforcement_service.create_action(session, tenant_id, data)
    await session.commit()
    return action
