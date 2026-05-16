"""
MedTrustX ZTA Engine Service — Decisions Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.zta import AccessDecisionResponse
from src.services import zta_service

router = APIRouter(prefix="/zta/access-decisions", tags=["Decisions"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get(
    "/{decision_id}",
    response_model=AccessDecisionResponse,
    summary="Get access decision details",
)
async def get_decision(
    decision_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    decision = await zta_service.get_access_decision(session, tenant_id, decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision
