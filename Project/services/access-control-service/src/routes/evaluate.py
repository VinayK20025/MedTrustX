"""
MedTrustX Access Control Service — Evaluate Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.access import AccessEvaluateRequest, AccessDecisionResponse
from src.services import access_service

router = APIRouter(prefix="/access", tags=["Evaluate"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/evaluate",
    response_model=AccessDecisionResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate an access request",
)
async def evaluate_access(
    data: AccessEvaluateRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    decision = await access_service.evaluate_access(session, tenant_id, data)
    await session.commit()
    return decision

@router.get(
    "/decisions/{decision_id}",
    response_model=AccessDecisionResponse,
    summary="Get an access decision",
)
async def get_decision(
    decision_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    decision = await access_service.get_access_decision(session, tenant_id, decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision
