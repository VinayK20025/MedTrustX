"""
MedTrustX Emergency (ER) Service — Priority Queue Routes

API Surface:
  GET    /er/queue   → Get real-time priority queue
"""
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.er import ERQueueEntryResponse, ERQueueResponse, EmergencyCaseResponse
from src.services import er_service

router = APIRouter(prefix="/er", tags=["ER Queue"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    """Extract tenant_id from request state, set by TenantMiddleware."""
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


@router.get(
    "/queue",
    response_model=ERQueueResponse,
    summary="Get real-time ER priority queue",
    description=(
        "Returns the current priority queue for the ER, ordered by "
        "priority (1 = highest/resuscitation) then by wait time "
        "(longest waiting first). Includes case summaries for each "
        "queue entry. Filter by 'waiting' or 'in_treatment' status."
    ),
)
async def get_queue(
    request: Request,
    status_filter: Optional[str] = Query(
        None, alias="status",
        description="Filter by queue status: waiting | in_treatment",
    ),
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    entries, total_waiting, total_in_treatment = await er_service.get_queue(
        session, tenant_id, status_filter=status_filter,
    )

    # Build response with denormalized case data
    queue_entries = []
    for entry in entries:
        entry_resp = ERQueueEntryResponse(
            id=entry.id,
            case_id=entry.case_id,
            priority=entry.priority,
            status=entry.status,
            wait_start=entry.wait_start,
            updated_at=entry.updated_at,
            case=EmergencyCaseResponse.model_validate(entry.emergency_case)
            if entry.emergency_case else None,
        )
        queue_entries.append(entry_resp)

    return ERQueueResponse(
        entries=queue_entries,
        total_waiting=total_waiting,
        total_in_treatment=total_in_treatment,
    )
