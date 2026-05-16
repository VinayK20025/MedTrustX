"""
MedTrustX Emergency (ER) Service — Staff Assignment Routes

API Surface:
  POST   /er/cases/{id}/assign   → Assign staff to a case
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.er import ERAssignmentCreate, ERAssignmentResponse
from src.services import er_service

router = APIRouter(prefix="/er/cases", tags=["Assignments"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    """Extract tenant_id from request state, set by TenantMiddleware."""
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


@router.post(
    "/{case_id}/assign",
    response_model=ERAssignmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign staff to an emergency case",
    description=(
        "Assigns a doctor, nurse, or specialist to an emergency case. "
        "If the role is 'attending_doctor', the case's primary doctor "
        "field is automatically updated. Multiple staff can be assigned "
        "to a single case."
    ),
)
async def assign_staff(
    case_id: uuid.UUID,
    data: ERAssignmentCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        assignment = await er_service.assign_staff(session, tenant_id, case_id, data)
        await session.commit()
        return assignment
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
