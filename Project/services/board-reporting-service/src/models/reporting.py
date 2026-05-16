"""
MedTrustX Board Reporting Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class Report(BaseModel):
    """Top-level board report entity."""
    __tablename__ = "reports"
    __table_args__ = (
        Index("ix_rpt_tenant_status", "tenant_id", "status"),
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False) # quarterly, annual, compliance, ad_hoc
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="draft")

class ReportSection(BaseModel):
    """Discrete content sections within a board report."""
    __tablename__ = "report_sections"
    __table_args__ = (
        Index("ix_sec_tenant_rpt", "tenant_id", "report_id"),
    )
    report_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    section_name: Mapped[str] = mapped_column(String(255), nullable=False) # executive_summary, risk_overview, financials
    content: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class ReportSchedule(BaseModel):
    """Defines automated cadence for periodic report generation."""
    __tablename__ = "report_schedules"
    __table_args__ = (
        Index("ix_sched_tenant_rpt", "tenant_id", "report_id"),
        Index("ix_sched_next_run", "next_run"),
    )
    report_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    frequency: Mapped[str] = mapped_column(String(50), nullable=False) # weekly, monthly, quarterly
    next_run: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

class ReportDistribution(BaseModel):
    """Tracks which board members received which reports and when."""
    __tablename__ = "report_distribution"
    __table_args__ = (
        Index("ix_dist_tenant_rpt", "tenant_id", "report_id"),
    )
    report_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    recipient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending") # pending, sent, read
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
