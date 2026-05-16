"""
MedTrustX Security Incident Response Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class Incident(BaseModel):
    """A physical security incident spanning from detection to resolution."""
    __tablename__ = "incidents"
    __table_args__ = (
        Index("ix_incident_status", "status"),
        Index("ix_incident_severity", "severity"),
    )
    type: Mapped[str] = mapped_column(String(100), nullable=False) # intrusion, fire, medical
    severity: Mapped[str] = mapped_column(String(50), nullable=False) # low, medium, high, critical
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open") # open, investigating, resolved
    location: Mapped[str] = mapped_column(String(255), nullable=False)

class IncidentAction(BaseModel):
    """Specific steps taken by responders to contain or resolve the incident."""
    __tablename__ = "incident_actions"
    __table_args__ = (
        Index("ix_action_incident", "incident_id"),
    )
    incident_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="initiated")
    performed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class Responder(BaseModel):
    """Personnel assigned to handle incidents."""
    __tablename__ = "responders"
    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    role: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="available") # available, dispatched
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class IncidentLog(BaseModel):
    """Immutable log of state changes for audit and post-mortem analysis."""
    __tablename__ = "incident_logs"
    __table_args__ = (
        Index("ix_ilog_incident", "incident_id"),
    )
    incident_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
