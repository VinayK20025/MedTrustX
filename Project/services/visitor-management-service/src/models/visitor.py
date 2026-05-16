"""
MedTrustX Visitor Management Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class Visitor(BaseModel):
    """External personnel registered within the facility."""
    __tablename__ = "visitors"
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    id_type: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. driving_license, passport
    id_value: Mapped[str] = mapped_column(String(255), nullable=False) # Encrypted or masked ID

class Visit(BaseModel):
    """An instance of a visitor entering the facility to see a specific host."""
    __tablename__ = "visits"
    __table_args__ = (
        Index("ix_visit_tenant_visitor", "tenant_id", "visitor_id"),
        Index("ix_visit_tenant_host", "tenant_id", "host_id"),
        Index("ix_visit_status", "status"),
    )
    visitor_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    host_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    purpose: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="scheduled") # scheduled, active, completed
    check_in: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    check_out: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

class Badge(BaseModel):
    """Temporary credentials assigned for a visit."""
    __tablename__ = "badges"
    __table_args__ = (
        Index("ix_badge_tenant_visit", "tenant_id", "visit_id"),
    )
    visit_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    badge_code: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="issued")
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class VisitLog(BaseModel):
    """Audit trail for the visitor lifecycle."""
    __tablename__ = "visit_logs"
    __table_args__ = (
        Index("ix_vlog_tenant_visit", "tenant_id", "visit_id"),
    )
    visit_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False) # check_in, check_out, badge_printed
