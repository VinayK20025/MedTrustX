"""
MedTrustX Role Management Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.role import Role, Permission, RolePermission, RoleHierarchy, UserRoleAssignment
from src.schemas.role import (
    RoleCreate, RoleUpdate, PermissionCreate, RolePermissionAssign, RoleHierarchyCreate, UserRoleAssign
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Roles ──

async def create_role(
    session: AsyncSession, tenant_id: uuid.UUID, data: RoleCreate
) -> Role:
    role = Role(
        tenant_id=tenant_id,
        name=data.name,
        description=data.description,
    )
    session.add(role)
    await session.flush()
    await publish_event("ROLE_CREATED", tenant_id, role.id, {"name": role.name})
    return role

async def get_role(
    session: AsyncSession, tenant_id: uuid.UUID, role_id: uuid.UUID
) -> Optional[Role]:
    result = await session.execute(
        select(Role).where(and_(Role.id == role_id, Role.tenant_id == tenant_id, Role.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_role(
    session: AsyncSession, tenant_id: uuid.UUID, role_id: uuid.UUID, data: RoleUpdate
) -> Optional[Role]:
    role = await get_role(session, tenant_id, role_id)
    if not role:
        return None
        
    if data.name is not None: role.name = data.name
    if data.description is not None: role.description = data.description
        
    role.updated_at = datetime.now(timezone.utc)
    await session.flush()
    await publish_event("ROLE_UPDATED", tenant_id, role.id)
    return role

# ── Permissions ──

async def create_permission(
    session: AsyncSession, tenant_id: uuid.UUID, data: PermissionCreate
) -> Permission:
    permission = Permission(
        tenant_id=tenant_id,
        name=data.name,
        resource=data.resource,
        action=data.action,
    )
    session.add(permission)
    await session.flush()
    return permission

async def get_permission(
    session: AsyncSession, tenant_id: uuid.UUID, permission_id: uuid.UUID
) -> Optional[Permission]:
    result = await session.execute(
        select(Permission).where(and_(Permission.id == permission_id, Permission.tenant_id == tenant_id, Permission.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Role Permissions ──

async def assign_permission_to_role(
    session: AsyncSession, tenant_id: uuid.UUID, role_id: uuid.UUID, data: RolePermissionAssign
) -> Optional[RolePermission]:
    role = await get_role(session, tenant_id, role_id)
    permission = await get_permission(session, tenant_id, data.permission_id)
    
    if not role or not permission:
        return None
        
    rp = RolePermission(
        role_id=role_id,
        permission_id=data.permission_id,
        tenant_id=tenant_id
    )
    session.add(rp)
    await session.flush()
    await publish_event("PERMISSION_ASSIGNED", tenant_id, rp.id, {"role_id": str(role_id), "permission_id": str(data.permission_id)})
    return rp

async def get_role_permissions(
    session: AsyncSession, tenant_id: uuid.UUID, role_id: uuid.UUID
) -> List[RolePermission]:
    result = await session.execute(
        select(RolePermission).where(and_(RolePermission.role_id == role_id, RolePermission.tenant_id == tenant_id, RolePermission.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

# ── Role Hierarchy ──

async def create_role_hierarchy(
    session: AsyncSession, tenant_id: uuid.UUID, role_id: uuid.UUID, data: RoleHierarchyCreate
) -> Optional[RoleHierarchy]:
    parent_role = await get_role(session, tenant_id, role_id)
    child_role = await get_role(session, tenant_id, data.child_role_id)
    
    if not parent_role or not child_role:
        return None
        
    hierarchy = RoleHierarchy(
        parent_role_id=role_id,
        child_role_id=data.child_role_id,
        tenant_id=tenant_id
    )
    session.add(hierarchy)
    await session.flush()
    return hierarchy

# ── User Roles ──

async def assign_role_to_user(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID, data: UserRoleAssign
) -> Optional[UserRoleAssignment]:
    role = await get_role(session, tenant_id, data.role_id)
    if not role:
        return None
        
    ura = UserRoleAssignment(
        user_id=user_id,
        role_id=data.role_id,
        tenant_id=tenant_id
    )
    session.add(ura)
    await session.flush()
    await publish_event("USER_ROLE_ASSIGNED", tenant_id, ura.id, {"user_id": str(user_id), "role_id": str(data.role_id)})
    return ura
