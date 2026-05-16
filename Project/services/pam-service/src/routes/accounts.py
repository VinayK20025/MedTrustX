"""
MedTrustX PAM Service — Accounts Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.pam import AccountResponse
from src.services import pam_service

router = APIRouter(prefix="/pam/accounts", tags=["Accounts"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get(
    "/",
    response_model=List[AccountResponse],
    summary="List privileged accounts",
)
async def get_accounts(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await pam_service.get_accounts(session, tenant_id)
