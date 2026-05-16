"""
MedTrustX Emergency (ER) Service — Triage Routes

API Surface:
  POST   /er/cases/{id}/triage   → Perform triage assessment
  GET    /er/cases/{id}/triage   → Get triage history for a case
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.er import TriageRecordCreate, TriageRecordResponse
from src.services import er_service

router = APIRouter(prefix="/er/cases", tags=["Triage"])


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
    "/{case_id}/triage",
    response_model=TriageRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Perform triage assessment",
    description=(
        "Records a triage assessment for an emergency case. Captures "
        "symptoms, vitals, and priority score (ESI 1-5). Automatically "
        "updates case severity and queue priority. A case can be "
        "re-triaged multiple times if the patient's condition changes."
    ),
)
async def create_triage(
    case_id: uuid.UUID,
    data: TriageRecordCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    # Extract triaged_by from JWT header if available
    triaged_by_raw = request.headers.get("X-User-ID")
    triaged_by = None
    if triaged_by_raw:
        try:
            triaged_by = uuid.UUID(triaged_by_raw)
        except ValueError:
            pass

    try:
        triage = await er_service.create_triage(
            session, tenant_id, case_id, data, triaged_by=triaged_by,
        )
        await session.commit()
        return triage
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/{case_id}/triage",
    response_model=List[TriageRecordResponse],
    summary="Get triage history",
    description=(
        "Returns all triage records for an emergency case, "
        "ordered by most recent first. Multiple records indicate "
        "re-triage events."
    ),
)
async def get_triage_records(
    case_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    records = await er_service.get_triage_records(session, tenant_id, case_id)
    return records
