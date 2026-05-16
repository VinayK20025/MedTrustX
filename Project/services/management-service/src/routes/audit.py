"""
MedTrustX Management Service — Audit Logs Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.management import ConfigAuditLogResponse
from src.services import management_service

router = APIRouter(prefix="/config-audit-logs", tags=["Audit Logs"])

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
    response_model=List[ConfigAuditLogResponse],
)
async def get_audit_logs(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await management_service.get_audit_logs(session, tenant_id)
