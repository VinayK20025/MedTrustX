"""
MedTrustX Housekeeping Service — Domain Entities

Five tables orchestrating tasks, room statuses, sanitation logs, waste, and events.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class HousekeepingTask(BaseModel):
    """A scheduled cleaning or sanitation task assigned to a staff member."""
    __tablename__ = "housekeeping_tasks"
    __table_args__ = (
        Index("ix_hk_task_room", "tenant_id", "room_id"),
        Index("ix_hk_task_status", "tenant_id", "status"),
        Index("ix_hk_task_type", "tenant_id", "task_type"),
    )

    room_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    task_type: Mapped[str] = mapped_column(String(100), nullable=False)  # routine, deep_clean, biohazard
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, in_progress, completed
    assigned_to: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class RoomStatus(BaseModel):
    """The current housekeeping status of a room (ready, dirty, etc.)."""
    __tablename__ = "room_status"
    __table_args__ = (
        Index("ix_hk_rs_room", "tenant_id", "room_id", unique=True),
    )

    room_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="dirty")  # dirty, cleaning, ready, inspection


class SanitationLog(BaseModel):
    """Compliance log of completed sanitation rounds for a specific area."""
    __tablename__ = "sanitation_logs"
    __table_args__ = (
        Index("ix_hk_san_area", "tenant_id", "area"),
    )

    area: Mapped[str] = mapped_column(String(100), nullable=False)
    cleaning_type: Mapped[str] = mapped_column(String(100), nullable=False)
    performed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class WasteManagement(BaseModel):
    """Tracking and weighing of segregated hospital waste (biomedical, general)."""
    __tablename__ = "waste_management"
    __table_args__ = (
        Index("ix_hk_waste_type", "tenant_id", "waste_type"),
    )

    waste_type: Mapped[str] = mapped_column(String(100), nullable=False)  # biomedical, sharp, general
    quantity: Mapped[float] = mapped_column(Float, nullable=False)  # in kg
    disposed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class HousekeepingEvent(BaseModel):
    """Event log for housekeeping triggers and alerts."""
    __tablename__ = "housekeeping_events"
    __table_args__ = (
        Index("ix_hk_ev_type", "tenant_id", "event_type"),
    )

    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
