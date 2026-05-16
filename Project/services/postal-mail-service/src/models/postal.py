"""
MedTrustX Postal Mail Service — Domain Entities

Messages, logs, queues, and bounces.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class EmailMessage(BaseModel):
    """Core tracking for outbound emails."""
    __tablename__ = "email_messages"
    __table_args__ = (
        Index("ix_postal_msg_status", "tenant_id", "status"),
    )

    to_address: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, sent, failed, bounced


class EmailLog(BaseModel):
    """Audit log of delivery attempts and SMTP responses."""
    __tablename__ = "email_logs"
    __table_args__ = (
        Index("ix_postal_log_msg", "tenant_id", "message_id"),
    )

    message_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)
    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class EmailQueue(BaseModel):
    """Retry logic queue for delayed or soft-failed messages."""
    __tablename__ = "email_queues"
    __table_args__ = (
        Index("ix_postal_queue_next", "tenant_id", "next_attempt"),
    )

    message_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    retry_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    next_attempt: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class EmailBounce(BaseModel):
    """Permanent or soft bounces explicitly tracked for analytics."""
    __tablename__ = "email_bounces"
    __table_args__ = (
        Index("ix_postal_bounce_msg", "tenant_id", "message_id"),
    )

    message_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    bounce_type: Mapped[str] = mapped_column(String(50), nullable=False)  # hard, soft, spam
    description: Mapped[str] = mapped_column(Text, nullable=True)
