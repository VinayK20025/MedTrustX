"""
MedTrustX Physical Access Control Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class AccessPoint(BaseModel):
    """Represents a physical door, turnstile, or reader."""
    __tablename__ = "access_points"
    __table_args__ = (
        Index("ix_ap_tenant_status", "tenant_id", "status"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="online")

class Credential(BaseModel):
    """Maps a user to a physical badge, biometric, or mobile token."""
    __tablename__ = "credentials"
    __table_args__ = (
        Index("ix_cred_tenant_user", "tenant_id", "user_id"),
        Index("ix_cred_value", "value"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False) # card, biometric, mobile
    value: Mapped[str] = mapped_column(String(255), nullable=False) # e.g. badge ID or token hash
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

class AccessPolicy(BaseModel):
    """Rules controlling which roles can enter which zones."""
    __tablename__ = "access_policies"
    role: Mapped[str] = mapped_column(String(100), nullable=False)
    zone: Mapped[str] = mapped_column(String(100), nullable=False)
    rules: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class AccessLog(BaseModel):
    """Immutable audit trail of entry and exit events."""
    __tablename__ = "access_logs"
    __table_args__ = (
        Index("ix_log_tenant_ap", "tenant_id", "access_point_id"),
        Index("ix_log_created_at", "created_at"),
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(PG_UUID(as_uuid=True), nullable=True) # None if unknown/denied
    access_point_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False) # entry, exit, check
    status: Mapped[str] = mapped_column(String(50), nullable=False) # granted, denied
