"""
MedTrustX Redpanda Console Service — Domain Entities

Postgres abstractions for console session audit and stream inspection logs.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import BigInteger, DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class ConsoleSession(BaseModel):
    """Tracks operator console sessions for audit purposes."""
    __tablename__ = "console_sessions"
    __table_args__ = (
        Index("ix_console_session_tenant", "tenant_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class TopicView(BaseModel):
    """Audit log of topic inspections performed by operators."""
    __tablename__ = "topic_views"
    __table_args__ = (
        Index("ix_console_topic_name", "tenant_id", "topic_name"),
    )

    topic_name: Mapped[str] = mapped_column(String(255), nullable=False)
    accessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )


class ConsumerGroupView(BaseModel):
    """Audit log of consumer group lag inspections."""
    __tablename__ = "consumer_group_views"
    __table_args__ = (
        Index("ix_console_cg_name", "tenant_id", "group_name"),
    )

    group_name: Mapped[str] = mapped_column(String(255), nullable=False)
    lag: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
