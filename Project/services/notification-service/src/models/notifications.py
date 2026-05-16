"""
MedTrustX Notification Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel

class Notification(BaseModel):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_tenant_recipient", "tenant_id", "recipient_id"),
        Index("ix_notifications_channel", "channel"),
        Index("ix_notifications_status", "status"),
    )

    recipient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    channel: Mapped[str] = mapped_column(String(20), nullable=False)
    template_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("notification_templates.id", ondelete="SET NULL"), nullable=True)
    payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default=text("'pending'"))

    template: Mapped[Optional["NotificationTemplate"]] = relationship("NotificationTemplate")
    logs: Mapped[List["NotificationLog"]] = relationship("NotificationLog", back_populates="notification", cascade="all, delete-orphan", order_by="NotificationLog.attempted_at.desc()")
    queue_items: Mapped[List["NotificationQueue"]] = relationship("NotificationQueue", back_populates="notification", cascade="all, delete-orphan")


class NotificationTemplate(BaseModel):
    __tablename__ = "notification_templates"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    channel: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)


class NotificationLog(BaseModel):
    __tablename__ = "notification_logs"

    notification_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    attempted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"))

    notification: Mapped["Notification"] = relationship("Notification", back_populates="logs")


class NotificationPreference(BaseModel):
    __tablename__ = "notification_preferences"
    __table_args__ = (
        Index("ix_preferences_tenant_user", "tenant_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    channel: Mapped[str] = mapped_column(String(20), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))


class NotificationQueue(BaseModel):
    __tablename__ = "notification_queue"
    __table_args__ = (
        Index("ix_queue_status_scheduled", "status", "scheduled_at"),
    )

    notification_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="queued", server_default=text("'queued'"))
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"))

    notification: Mapped["Notification"] = relationship("Notification", back_populates="queue_items")
