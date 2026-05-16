"""
MedTrustX Keycloak Shim Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Boolean, text
from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

# Note: We add tenant_id to support the realm concept cleanly within our DB.
class KeycloakUser(BaseModel):
    __tablename__ = "keycloak_users"
    __table_args__ = (
        Index("ix_kc_user_tenant_username", "tenant_id", "username", unique=True),
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    username: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))

class KeycloakSession(BaseModel):
    __tablename__ = "keycloak_sessions"
    __table_args__ = (
        Index("ix_kc_session_user", "user_id"),
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    session_state: Mapped[str] = mapped_column(String(100), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

class KeycloakClient(BaseModel):
    __tablename__ = "keycloak_clients"
    __table_args__ = (
        Index("ix_kc_client_id", "client_id", unique=True),
    )
    
    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    client_id: Mapped[str] = mapped_column(String(100), nullable=False)
    secret: Mapped[str] = mapped_column(TEXT, nullable=False)
    redirect_uri: Mapped[str] = mapped_column(TEXT, nullable=True)

class KeycloakRole(BaseModel):
    __tablename__ = "keycloak_roles"
    __table_args__ = (
        Index("ix_kc_role_name", "role_name"),
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    role_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(TEXT, nullable=True)

class KeycloakToken(BaseModel):
    __tablename__ = "keycloak_tokens"
    __table_args__ = (
        Index("ix_kc_token_user", "user_id"),
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    token: Mapped[str] = mapped_column(TEXT, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
