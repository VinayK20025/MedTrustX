"""
MedTrustX Role Management Service — Hierarchy Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.role import RoleHierarchyCreate, RoleHierarchyResponse
from src.services import role_service

router = APIRouter(prefix="/roles/{role_id}/hierarchy", tags=["Hierarchy"])

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
    response_model=RoleHierarchyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a role hierarchy link",
)
async def create_hierarchy(
    role_id: uuid.UUID,
    data: RoleHierarchyCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    hierarchy = await role_service.create_role_hierarchy(session, tenant_id, role_id, data)
    if not hierarchy:
        raise HTTPException(status_code=400, detail="Invalid parent or child role")
    await session.commit()
    return hierarchy
