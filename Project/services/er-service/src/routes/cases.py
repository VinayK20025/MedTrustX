"""
MedTrustX Emergency (ER) Service — Emergency Case Routes

API Surface:
  POST   /er/cases           → Register new emergency case
  GET    /er/cases           → List cases (with filters)
  GET    /er/cases/{id}      → Get case detail with triage, assignments, events
  PUT    /er/cases/{id}      → Update case (status, severity, disposition)
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.er import (
    EmergencyCaseCreate,
    EmergencyCaseDetail,
    EmergencyCaseList,
    EmergencyCaseResponse,
    EmergencyCaseUpdate,
)
from src.services import er_service

router = APIRouter(prefix="/er/cases", tags=["Emergency Cases"])


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
    "/",
    response_model=EmergencyCaseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new emergency case",
    description=(
        "Creates a new emergency case for a patient arrival. "
        "Automatically adds the case to the priority queue and "
        "logs a CASE_REGISTERED event."
    ),
)
async def create_case(
    data: EmergencyCaseCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    case = await er_service.create_case(session, tenant_id, data)
    await session.commit()
    return await er_service.get_case(session, tenant_id, case.id)


@router.get(
    "/",
    response_model=EmergencyCaseList,
    summary="List emergency cases",
    description=(
        "Returns a paginated list of emergency cases with optional "
        "filters for status and severity level."
    ),
)
async def list_cases(
    request: Request,
    status_filter: Optional[str] = Query(
        None, alias="status",
        description="Filter by status: registered | triaged | in_treatment | discharged | admitted",
    ),
    severity: Optional[str] = Query(
        None,
        description="Filter by severity: critical | high | medium | low | non_urgent",
    ),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    cases, total = await er_service.list_cases(
        session, tenant_id,
        status=status_filter,
        severity_level=severity,
        page=page,
        page_size=page_size,
    )
    return EmergencyCaseList(
        items=cases,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{case_id}",
    response_model=EmergencyCaseDetail,
    summary="Get emergency case details",
    description=(
        "Returns full case details including triage records, "
        "staff assignments, and event timeline."
    ),
)
async def get_case(
    case_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    case = await er_service.get_case(session, tenant_id, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Emergency case not found")
    return case


@router.put(
    "/{case_id}",
    response_model=EmergencyCaseResponse,
    summary="Update emergency case",
    description=(
        "Updates case status, severity, assigned doctor, or disposition. "
        "Status transitions are validated and trigger appropriate events. "
        "Terminal states (discharged, admitted, transferred) close the case."
    ),
)
async def update_case(
    case_id: uuid.UUID,
    data: EmergencyCaseUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    case = await er_service.update_case(session, tenant_id, case_id, data)
    if not case:
        raise HTTPException(status_code=404, detail="Emergency case not found")
    await session.commit()
    return await er_service.get_case(session, tenant_id, case_id)
