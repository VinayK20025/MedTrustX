"""
MedTrustX ZTA Engine Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class TrustSession(BaseModel):
    __tablename__ = "trust_sessions"
    __table_args__ = (
        Index("ix_trust_sess_tenant_user", "tenant_id", "user_id"),
        Index("ix_trust_sess_risk_trust", "risk_score", "trust_level"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default=text("0"))
    trust_level: Mapped[str] = mapped_column(String(20), nullable=False, default="high", server_default=text("'high'"))


class ContextAttribute(BaseModel):
    __tablename__ = "context_attributes"
    __table_args__ = (
        Index("ix_ctx_attrs_session", "session_id"),
    )

    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    attribute_key: Mapped[str] = mapped_column(String(100), nullable=False)
    attribute_value: Mapped[str] = mapped_column(TEXT, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class RiskEvent(BaseModel):
    __tablename__ = "risk_events"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class AccessDecision(BaseModel):
    __tablename__ = "access_decisions"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    resource: Mapped[str] = mapped_column(String(100), nullable=False)
    decision: Mapped[str] = mapped_column(String(20), nullable=False)
    reason: Mapped[str] = mapped_column(TEXT, nullable=False)
    decided_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class DeviceProfile(BaseModel):
    __tablename__ = "device_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    device_id: Mapped[str] = mapped_column(String(100), nullable=False)
    trust_level: Mapped[str] = mapped_column(String(20), nullable=False, default="unknown", server_default=text("'unknown'"))
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
