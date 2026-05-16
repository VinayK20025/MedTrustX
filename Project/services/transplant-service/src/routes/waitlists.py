"""
MedTrustX Transplant Service — Waitlists Routes
"""
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.transplant import WaitlistCreate, WaitlistResponse
from src.services import transplant_service

router = APIRouter(prefix="/waitlists", tags=["Waitlists"])

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
    response_model=WaitlistResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add to waitlist",
)
async def add_to_waitlist(
    data: WaitlistCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    waitlist = await transplant_service.add_to_waitlist(session, tenant_id, data)
    await session.commit()
    return waitlist

@router.get(
    "/",
    response_model=List[WaitlistResponse],
    summary="Get waitlists",
)
async def get_waitlists(
    request: Request,
    organ_type: Optional[str] = Query(None, description="Filter by organ type"),
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await transplant_service.get_waitlists(session, tenant_id, organ_type)
