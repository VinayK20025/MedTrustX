"""
MedTrustX MPI Service — Matching Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.mpi import MatchRequest, MatchCandidateResponse
from src.services import mpi_service

router = APIRouter(prefix="/mpi/match", tags=["Matching"])

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
    response_model=MatchCandidateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Evaluate a match between two patients",
)
async def create_match(
    data: MatchRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    cand = await mpi_service.create_match_candidate(session, tenant_id, data)
    await session.commit()
    return cand
