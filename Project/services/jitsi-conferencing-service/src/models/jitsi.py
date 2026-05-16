"""
MedTrustX Jitsi Conferencing Service — Domain Entities

Rooms, participants, sessions, and media logs.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class ConferenceRoom(BaseModel):
    """A virtual room for video conferencing."""
    __tablename__ = "conference_rooms"

    room_name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)


class Participant(BaseModel):
    """Users joined to a specific conference room."""
    __tablename__ = "participants"
    __table_args__ = (
        Index("ix_jitsi_part_room", "tenant_id", "room_id"),
        Index("ix_jitsi_part_user", "tenant_id", "user_id"),
    )

    room_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="attendee")  # host, attendee
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class ConferenceSession(BaseModel):
    """The actual active meeting instance."""
    __tablename__ = "conference_sessions"
    __table_args__ = (
        Index("ix_jitsi_session_status", "tenant_id", "status"),
    )

    room_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active, ended


class MediaLog(BaseModel):
    """Events and analytics regarding the session media."""
    __tablename__ = "media_logs"
    __table_args__ = (
        Index("ix_jitsi_medialog_session", "tenant_id", "session_id"),
    )

    session_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
