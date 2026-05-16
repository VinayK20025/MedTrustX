"""
MedTrustX Zero Trust Network Control Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class AccessPolicy(BaseModel):
    """Zero Trust Micro-segmentation Policies."""
    __tablename__ = "access_policies"
    policy_name: Mapped[str] = mapped_column(String(255), nullable=False)
    rules: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class NetworkSession(BaseModel):
    """Active validated connection to the network."""
    __tablename__ = "network_sessions"
    __table_args__ = (
        Index("ix_session_tenant_user", "tenant_id", "user_id"),
        Index("ix_session_status", "status"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class DevicePosture(BaseModel):
    """Compliance state of connecting devices."""
    __tablename__ = "device_posture"
    __table_args__ = (
        Index("ix_posture_tenant_device", "tenant_id", "device_id"),
    )
    device_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    compliance_status: Mapped[str] = mapped_column(String(50), nullable=False) # compliant, non_compliant
    attributes: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class AccessDecision(BaseModel):
    """Audit log of all evaluated access requests."""
    __tablename__ = "access_decisions"
    session_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    decision: Mapped[str] = mapped_column(String(50), nullable=False) # allow, deny
    reason: Mapped[str] = mapped_column(Text, nullable=True)
