"""
MedTrustX Redis Cache Service — Domain Entities

Metadata tables to support or back up cache namespaces, sessions, and rate limits.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class CacheKey(BaseModel):
    """Metadata and fallback storage for cache entries."""
    __tablename__ = "cache_keys"
    __table_args__ = (
        Index("ix_redis_cache_key", "tenant_id", "cache_key"),
    )

    cache_key: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[dict] = mapped_column(JSONB, nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class SessionStore(BaseModel):
    """Fallback storage for active user sessions."""
    __tablename__ = "session_store"
    __table_args__ = (
        Index("ix_redis_session_id", "tenant_id", "session_id"),
        Index("ix_redis_session_expires", "tenant_id", "expires_at"),
    )

    session_id: Mapped[str] = mapped_column(String(255), nullable=False)
    data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class RateLimit(BaseModel):
    """State management for API rate limits."""
    __tablename__ = "rate_limits"
    __table_args__ = (
        Index("ix_redis_ratelimit_key", "tenant_id", "key"),
    )

    key: Mapped[str] = mapped_column(String(255), nullable=False)
    request_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    window_start: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
