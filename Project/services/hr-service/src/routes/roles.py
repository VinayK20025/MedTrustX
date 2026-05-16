"""
MedTrustX HR Service — Roles Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.hr import RoleCreate, RoleResponse
from src.services import hr_service

router = APIRouter(prefix="/roles", tags=["Roles"])

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
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new job role",
)
async def create_role(
    data: RoleCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    role = await hr_service.create_role(session, tenant_id, data)
    await session.commit()
    return role

@router.get(
    "/{role_id}",
    response_model=RoleResponse,
    summary="Get role details",
)
async def get_role(
    role_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    role = await hr_service.get_role(session, tenant_id, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role
