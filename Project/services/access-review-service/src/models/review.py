"""
MedTrustX Access Review Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class ReviewCampaign(BaseModel):
    __tablename__ = "review_campaigns"
    __table_args__ = (
        Index("ix_rev_camp_tenant_id", "tenant_id", "id"),
        Index("ix_rev_camp_status", "status"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    scope: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", server_default=text("'active'"))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
    ended_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


class ReviewItem(BaseModel):
    __tablename__ = "review_items"
    __table_args__ = (
        Index("ix_rev_item_tenant_camp", "tenant_id", "campaign_id"),
        Index("ix_rev_item_user", "user_id"),
        Index("ix_rev_item_status", "status"),
    )

    campaign_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default=text("'pending'"))
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


class Certification(BaseModel):
    __tablename__ = "certifications"

    review_item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    reviewer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    decision: Mapped[str] = mapped_column(String(20), nullable=False)
    comments: Mapped[str] = mapped_column(TEXT, nullable=True)
    decided_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class AccessAnomaly(BaseModel):
    __tablename__ = "access_anomalies"
    __table_args__ = (
        Index("ix_acc_anom_user", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    anomaly_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class Revocation(BaseModel):
    __tablename__ = "revocations"
    __table_args__ = (
        Index("ix_revoc_user", "user_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    role_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    reason: Mapped[str] = mapped_column(TEXT, nullable=True)
    revoked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
