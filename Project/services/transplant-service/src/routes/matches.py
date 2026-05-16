"""
MedTrustX Transplant Service — Matches Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.transplant import MatchCreate, MatchResponse
from src.services import transplant_service

router = APIRouter(prefix="/matches", tags=["Matches"])

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
    response_model=MatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a match",
)
async def create_match(
    data: MatchCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    match = await transplant_service.create_match(session, tenant_id, data)
    await session.commit()
    return match

@router.get(
    "/{match_id}",
    response_model=MatchResponse,
    summary="Get match details",
)
async def get_match(
    match_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    match = await transplant_service.get_match(session, tenant_id, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match
