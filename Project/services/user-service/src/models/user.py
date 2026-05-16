"""
MedTrustX User Management Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class UserProfile(BaseModel):
    __tablename__ = "user_profiles"
    __table_args__ = (
        Index("ix_user_prof_tenant_iam", "tenant_id", "iam_user_id"),
        Index("ix_user_prof_status", "status"),
    )

    iam_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str] = mapped_column(String(100), nullable=True)
    email: Mapped[str] = mapped_column(String(100), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", server_default=text("'active'"))


class UserPreference(BaseModel):
    __tablename__ = "user_preferences"
    __table_args__ = (
        Index("ix_user_pref_user_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    preference_key: Mapped[str] = mapped_column(String(100), nullable=False)
    preference_value: Mapped[dict] = mapped_column(JSONB, nullable=False)


class UserSetting(BaseModel):
    __tablename__ = "user_settings"
    __table_args__ = (
        Index("ix_user_sett_user_id", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    setting_key: Mapped[str] = mapped_column(String(100), nullable=False)
    setting_value: Mapped[dict] = mapped_column(JSONB, nullable=False)


class UserLink(BaseModel):
    __tablename__ = "user_links"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    linked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class UserStatusLog(BaseModel):
    __tablename__ = "user_status_logs"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
