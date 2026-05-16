"""
MedTrustX PAM Service — Sessions Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.pam import SessionStart, SessionResponse
from src.services import pam_service

router = APIRouter(prefix="/pam", tags=["Sessions"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/start-session",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a privileged session",
)
async def start_session(
    data: SessionStart,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    sess = await pam_service.start_session(session, tenant_id, data)
    if not sess:
        raise HTTPException(status_code=400, detail="Request not approved or invalid")
    await session.commit()
    return sess

@router.post(
    "/end-session",
    response_model=SessionResponse,
    summary="End a privileged session",
)
async def end_session(
    session_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    sess = await pam_service.end_session(session, tenant_id, session_id)
    if not sess:
        raise HTTPException(status_code=400, detail="Session not active or invalid")
    await session.commit()
    return sess

@router.get(
    "/sessions/{session_id}",
    response_model=SessionResponse,
    summary="Get session details",
)
async def get_session(
    session_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    sess = await pam_service.get_session_info(session, tenant_id, session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    return sess
