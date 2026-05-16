"""
MedTrustX ZTA Engine Service — Sessions Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.zta import TrustSessionResponse
from src.services import zta_service

router = APIRouter(prefix="/zta/sessions", tags=["Sessions"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get(
    "/{session_id}",
    response_model=TrustSessionResponse,
    summary="Get trust session details",
)
async def get_session(
    session_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    trust_session = await zta_service.get_session_by_id(session, tenant_id, session_id)
    if not trust_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return trust_session
