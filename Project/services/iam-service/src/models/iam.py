"""
MedTrustX IAM Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID, TEXT
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    __table_args__ = (
        Index("ix_users_tenant_username", "tenant_id", "username"),
    )

    username: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=False)
    password_hash: Mapped[str] = mapped_column(TEXT, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", server_default=text("'active'"))


class Role(BaseModel):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(TEXT, nullable=True)


class UserRole(BaseModel):
    __tablename__ = "user_roles"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class Session(BaseModel):
    __tablename__ = "sessions"
    __table_args__ = (
        Index("ix_sessions_token", "token"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    token: Mapped[str] = mapped_column(TEXT, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class IdentityProvider(BaseModel):
    __tablename__ = "identity_providers"

    provider_name: Mapped[str] = mapped_column(String(100), nullable=False)
    config: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
