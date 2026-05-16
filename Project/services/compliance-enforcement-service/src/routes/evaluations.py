"""
MedTrustX Compliance Enforcement Service — Evaluations Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.enforcement import ComplianceEvaluationRequest, ComplianceEvaluationResponse
from src.services import enforcement_service

router = APIRouter(prefix="/compliance/evaluate", tags=["Compliance Evaluations"])

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
    response_model=ComplianceEvaluationResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate compliance for an action",
)
async def evaluate_compliance(
    data: ComplianceEvaluationRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    evaluation = await enforcement_service.evaluate(session, tenant_id, data)
    await session.commit()
    return evaluation
