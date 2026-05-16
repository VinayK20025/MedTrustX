"""
MedTrustX Role Management Service — User Roles Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.role import UserRoleAssign, UserRoleResponse
from src.services import role_service

router = APIRouter(prefix="/users/{user_id}/roles", tags=["User Roles"])

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
    response_model=UserRoleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign a role to a user",
)
async def assign_user_role(
    user_id: uuid.UUID,
    data: UserRoleAssign,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    ura = await role_service.assign_role_to_user(session, tenant_id, user_id, data)
    if not ura:
        raise HTTPException(status_code=400, detail="Role not found")
    await session.commit()
    return ura
