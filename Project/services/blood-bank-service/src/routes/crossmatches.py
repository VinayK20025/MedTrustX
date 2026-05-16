"""
MedTrustX Blood Bank Service — Crossmatch Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.blood_bank import CrossmatchCreate, CrossmatchResponse
from src.services import blood_bank_service

router = APIRouter(prefix="/crossmatch", tags=["Crossmatch"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id(request: Request) -> uuid.UUID:
    user_id_str = getattr(request.state, "user_id", None) or request.headers.get("X-User-ID")
    if not user_id_str:
        return uuid.uuid4()
    return uuid.UUID(str(user_id_str))

@router.post(
    "/",
    response_model=CrossmatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record crossmatch compatibility result",
)
async def record_crossmatch(
    data: CrossmatchCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    cm = await blood_bank_service.record_crossmatch(session, tenant_id, user_id, data)
    await session.commit()
    return cm

@router.get(
    "/{cm_id}",
    response_model=CrossmatchResponse,
    summary="Get crossmatch result details",
)
async def get_crossmatch(
    cm_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    cm = await blood_bank_service.get_crossmatch(session, tenant_id, cm_id)
    if not cm:
        raise HTTPException(status_code=404, detail="Crossmatch record not found")
    return cm
