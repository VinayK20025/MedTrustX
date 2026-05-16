"""
MedTrustX RCM Service — Reimbursements Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.rcm import ReimbursementCreate, ReimbursementResponse
from src.services import rcm_service

router = APIRouter(prefix="/reimbursements", tags=["Reimbursements"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/{claim_id}",
    response_model=ReimbursementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record physical cash realization against a claim",
)
async def create_reimbursement(
    claim_id: uuid.UUID,
    data: ReimbursementCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        reimb = await rcm_service.process_reimbursement(session, tenant_id, claim_id, data)
        await session.commit()
        return reimb
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
