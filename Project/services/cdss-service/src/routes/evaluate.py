"""
MedTrustX CDSS Service — Evaluate Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.cdss import CDSSEvaluateRequest, CDSSEvaluateResponse
from src.services import cdss_service

router = APIRouter(prefix="/cdss/evaluate", tags=["Engine"])

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
    response_model=CDSSEvaluateResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit clinical context payload to the inference engine",
)
async def evaluate_context(
    data: CDSSEvaluateRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    evaluation = await cdss_service.evaluate_context(session, tenant_id, data)
    await session.commit()
    return evaluation
