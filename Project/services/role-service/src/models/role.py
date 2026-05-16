"""
MedTrustX Role Management Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class Role(BaseModel):
    __tablename__ = "roles"
    __table_args__ = (
        Index("ix_roles_tenant_id", "tenant_id", "id"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(TEXT, nullable=True)


class Permission(BaseModel):
    __tablename__ = "permissions"
    __table_args__ = (
        Index("ix_perms_tenant_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    resource: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)


class RolePermission(BaseModel):
    __tablename__ = "role_permissions"
    __table_args__ = (
        Index("ix_role_perms_perm_id", "permission_id"),
    )

    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    permission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class RoleHierarchy(BaseModel):
    __tablename__ = "role_hierarchy"

    parent_role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    child_role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)


class UserRoleAssignment(BaseModel):
    __tablename__ = "user_role_assignments"
    __table_args__ = (
        Index("ix_user_roles_user_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
