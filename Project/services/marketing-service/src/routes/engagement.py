"""
MedTrustX Marketing Service — Engagement Events Routes
"""
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.marketing import EngagementEventCreate, EngagementEventResponse
from src.services import marketing_service

router = APIRouter(prefix="/engagement-events", tags=["Engagement Events"])

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
    response_model=EngagementEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record an engagement event",
)
async def create_engagement_event(
    data: EngagementEventCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    event = await marketing_service.create_engagement_event(session, tenant_id, data)
    await session.commit()
    return event

@router.get(
    "/",
    response_model=List[EngagementEventResponse],
    summary="Get engagement events",
)
async def get_engagement_events(
    request: Request,
    campaign_id: Optional[uuid.UUID] = Query(None, description="Filter by campaign"),
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await marketing_service.get_engagement_events(session, tenant_id, campaign_id)
