"""
MedTrustX PAM Service — Requests Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.pam import AccessRequestCreate, AccessRequestResponse
from src.services import pam_service

router = APIRouter(prefix="/pam/requests", tags=["Requests"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/{path:path}", # Alias to handle /pam/request-access too in main
    response_model=AccessRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Request privileged access",
)
async def request_access(
    data: AccessRequestCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    req = await pam_service.create_request(session, tenant_id, data)
    await session.commit()
    return req

@router.get(
    "/{request_id}",
    response_model=AccessRequestResponse,
    summary="Get a privilege request",
)
async def get_request(
    request_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    req = await pam_service.get_request(session, tenant_id, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    return req
