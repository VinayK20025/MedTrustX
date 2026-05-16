"""
MedTrustX Nursing Service — Shift Handover Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.nursing import ShiftHandoverCreate, ShiftHandoverResponse
from src.services import nursing_service

router = APIRouter(prefix="/nursing/shifts", tags=["Shifts"])

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
    "/handover",
    response_model=ShiftHandoverResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record shift handover",
)
async def record_handover(
    data: ShiftHandoverCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    handover = await nursing_service.add_shift_handover(session, tenant_id, user_id, data)
    await session.commit()
    return handover
