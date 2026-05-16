"""
MedTrustX Coturn Relay Service — Domain Entities

Sessions, credentials, and usage logs.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import BigInteger, DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class TurnSession(BaseModel):
    """Active or historical STUN/TURN relay sessions."""
    __tablename__ = "turn_sessions"
    __table_args__ = (
        Index("ix_coturn_session_user", "tenant_id", "user_id"),
        Index("ix_coturn_session_id", "tenant_id", "session_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    session_id: Mapped[str] = mapped_column(String(100), nullable=False)
    relay_ip: Mapped[str] = mapped_column(String(50), nullable=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class TurnCredential(BaseModel):
    """Short-lived access credentials generated for TURN servers."""
    __tablename__ = "turn_credentials"
    __table_args__ = (
        Index("ix_coturn_cred_expiry", "tenant_id", "expires_at"),
    )

    username: Mapped[str] = mapped_column(String(100), nullable=False)
    credential: Mapped[str] = mapped_column(String(255), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class RelayUsageLog(BaseModel):
    """Bandwidth usage and performance logs for relay operations."""
    __tablename__ = "relay_usage_logs"
    __table_args__ = (
        Index("ix_coturn_usage_session", "tenant_id", "session_id"),
    )

    session_id: Mapped[str] = mapped_column(String(100), nullable=False)
    bytes_transferred: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
