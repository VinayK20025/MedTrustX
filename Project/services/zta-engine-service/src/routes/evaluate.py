"""
MedTrustX ZTA Engine Service — Evaluate Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.zta import AccessEvaluationRequest, AccessDecisionResponse
from src.services import zta_service

router = APIRouter(prefix="/zta/evaluate-access", tags=["Evaluate"])

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
    response_model=AccessDecisionResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate dynamic access to a resource",
)
async def evaluate_access(
    data: AccessEvaluationRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    decision = await zta_service.evaluate_access(session, tenant_id, data)
    await session.commit()
    return decision
