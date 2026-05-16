"""
MedTrustX User Management Service — Profiles Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.user import UserProfileResponse
from src.services import user_service

router = APIRouter(prefix="/users/{user_id}/profile", tags=["Profiles"])

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
    response_model=UserProfileResponse,
    summary="Get a user profile (alias for GET /users/{id})",
)
async def get_profile(
    user_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    profile = await user_service.get_user_profile(session, tenant_id, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile
