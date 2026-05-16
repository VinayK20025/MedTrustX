"""
MedTrustX Emergency (ER) Service — Event Log Routes

API Surface:
  POST   /er/cases/{id}/events   → Log a custom event
  GET    /er/cases/{id}/events   → Get event timeline for a case
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.er import EREventCreate, EREventResponse
from src.services import er_service

router = APIRouter(prefix="/er/cases", tags=["ER Events"])


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
    "/{case_id}/events",
    response_model=EREventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log an event against an emergency case",
    description=(
        "Records a custom event in the case timeline. Events are "
        "immutable and provide a complete audit trail. System events "
        "(CASE_REGISTERED, TRIAGE_COMPLETED, etc.) are logged "
        "automatically; this endpoint is for manual annotations."
    ),
)
async def create_event(
    case_id: uuid.UUID,
    data: EREventCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    # Extract actor from JWT header if available
    actor_id_raw = request.headers.get("X-User-ID")
    actor_id = None
    if actor_id_raw:
        try:
            actor_id = uuid.UUID(actor_id_raw)
        except ValueError:
            pass

    try:
        event = await er_service.create_event(
            session, tenant_id, case_id, data, actor_id=actor_id,
        )
        await session.commit()
        return event
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/{case_id}/events",
    response_model=List[EREventResponse],
    summary="Get case event timeline",
    description=(
        "Returns the complete event timeline for an emergency case, "
        "ordered by most recent first. Includes both system-generated "
        "and manually-logged events."
    ),
)
async def get_events(
    case_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    events = await er_service.get_events(session, tenant_id, case_id)
    return events
