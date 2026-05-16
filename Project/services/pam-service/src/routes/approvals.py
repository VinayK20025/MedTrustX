"""
MedTrustX PAM Service — Approvals Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.pam import ApprovalAction, AccessRequestResponse
from src.services import pam_service

router = APIRouter(prefix="/pam", tags=["Approvals"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/approve",
    response_model=AccessRequestResponse,
    summary="Approve a privilege request",
)
async def approve_request(
    data: ApprovalAction,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    req = await pam_service.process_approval(session, tenant_id, data, approve=True)
    if not req:
        raise HTTPException(status_code=400, detail="Invalid request or not pending")
    await session.commit()
    return req

@router.post(
    "/reject",
    response_model=AccessRequestResponse,
    summary="Reject a privilege request",
)
async def reject_request(
    data: ApprovalAction,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    req = await pam_service.process_approval(session, tenant_id, data, approve=False)
    if not req:
        raise HTTPException(status_code=400, detail="Invalid request or not pending")
    await session.commit()
    return req
