"""
MedTrustX Marketing Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import DateTime, ForeignKey, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel

class Campaign(BaseModel):
    __tablename__ = "campaigns"
    __table_args__ = (
        Index("ix_campaigns_tenant", "tenant_id"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    channel: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft", server_default=text("'draft'"))
    start_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    targets: Mapped[List["CampaignTarget"]] = relationship("CampaignTarget", back_populates="campaign", cascade="all, delete-orphan")
    events: Mapped[List["EngagementEvent"]] = relationship("EngagementEvent", back_populates="campaign", cascade="all, delete-orphan")


class CampaignTarget(BaseModel):
    __tablename__ = "campaign_targets"
    __table_args__ = (
        Index("ix_camp_target_tenant_camp", "tenant_id", "campaign_id"),
        Index("ix_camp_target_patient", "patient_id"),
    )

    campaign_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default=text("'pending'"))
    targeted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    campaign: Mapped["Campaign"] = relationship("Campaign", back_populates="targets")


class Segment(BaseModel):
    __tablename__ = "segments"
    __table_args__ = (
        Index("ix_segments_tenant_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    definition: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)


class EngagementEvent(BaseModel):
    __tablename__ = "engagement_events"
    __table_args__ = (
        Index("ix_engage_events_type_created", "event_type", "created_at"),
        Index("ix_engage_events_patient", "patient_id"),
    )

    campaign_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    event_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSONB, nullable=True)

    campaign: Mapped[Optional["Campaign"]] = relationship("Campaign", back_populates="events")


class Funnel(BaseModel):
    __tablename__ = "funnels"
    __table_args__ = (
        Index("ix_funnels_tenant_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    stages: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
