"""
MedTrustX Telemedicine Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import BaseModel

class TeleSession(BaseModel):
    __tablename__ = "tele_sessions"
    __table_args__ = (
        Index("ix_tele_sessions_tenant_session", "tenant_id", "id"),
        Index("ix_tele_sessions_appointment", "appointment_id"),
        Index("ix_tele_sessions_status_scheduled", "status", "scheduled_at"),
    )

    appointment_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    doctor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="scheduled", server_default=text("'scheduled'"))
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    participants: Mapped[List["SessionParticipant"]] = relationship("SessionParticipant", back_populates="session", cascade="all, delete-orphan")
    events: Mapped[List["SessionEvent"]] = relationship("SessionEvent", back_populates="session", cascade="all, delete-orphan", order_by="SessionEvent.created_at.desc()")
    recordings: Mapped[List["Recording"]] = relationship("Recording", back_populates="session", cascade="all, delete-orphan")
    tokens: Mapped[List["SessionToken"]] = relationship("SessionToken", back_populates="session", cascade="all, delete-orphan")


class SessionParticipant(BaseModel):
    __tablename__ = "session_participants"
    
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tele_sessions.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    join_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    leave_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    session: Mapped["TeleSession"] = relationship("TeleSession", back_populates="participants")


class SessionEvent(BaseModel):
    __tablename__ = "session_events"

    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tele_sessions.id", ondelete="CASCADE"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    session: Mapped["TeleSession"] = relationship("TeleSession", back_populates="events")


class Recording(BaseModel):
    __tablename__ = "recordings"

    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tele_sessions.id", ondelete="CASCADE"), nullable=False)
    file_url: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="processing", server_default=text("'processing'"))

    session: Mapped["TeleSession"] = relationship("TeleSession", back_populates="recordings")


class SessionToken(BaseModel):
    __tablename__ = "session_tokens"

    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("tele_sessions.id", ondelete="CASCADE"), nullable=False)
    token: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    session: Mapped["TeleSession"] = relationship("TeleSession", back_populates="tokens")
