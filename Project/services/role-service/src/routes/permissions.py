"""
MedTrustX Role Management Service — Permissions Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.role import (
    PermissionCreate, PermissionResponse, RolePermissionAssign, RolePermissionResponse
)
from src.services import role_service

router = APIRouter(tags=["Permissions"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/permissions",
    response_model=PermissionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new permission",
)
async def create_permission(
    data: PermissionCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    permission = await role_service.create_permission(session, tenant_id, data)
    await session.commit()
    return permission

@router.get(
    "/permissions/{permission_id}",
    response_model=PermissionResponse,
    summary="Get a permission",
)
async def get_permission(
    permission_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    permission = await role_service.get_permission(session, tenant_id, permission_id)
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission

@router.post(
    "/roles/{role_id}/permissions",
    response_model=RolePermissionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Assign a permission to a role",
)
async def assign_permission(
    role_id: uuid.UUID,
    data: RolePermissionAssign,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    rp = await role_service.assign_permission_to_role(session, tenant_id, role_id, data)
    if not rp:
        raise HTTPException(status_code=400, detail="Role or Permission not found")
    await session.commit()
    return rp

@router.get(
    "/roles/{role_id}/permissions",
    response_model=List[RolePermissionResponse],
    summary="Get permissions assigned to a role",
)
async def get_role_permissions(
    role_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await role_service.get_role_permissions(session, tenant_id, role_id)
