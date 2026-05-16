"""
MedTrustX User Management Service — Links Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.user import UserLinkCreate, UserLinkResponse
from src.services import user_service

router = APIRouter(prefix="/users/{user_id}/links", tags=["Links"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/",
    response_model=UserLinkResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Link a user to an entity",
)
async def create_link(
    user_id: uuid.UUID,
    data: UserLinkCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    link = await user_service.create_user_link(session, tenant_id, user_id, data)
    await session.commit()
    return link
