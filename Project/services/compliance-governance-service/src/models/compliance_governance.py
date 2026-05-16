"""
MedTrustX Compliance Governance Service — Domain Entities

Five tables governing policies, controls, violations, evidence, and reports.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class CompliancePolicy(BaseModel):
    """Institutional or regulatory policy defining rules (e.g. HIPAA Privacy Rule)."""
    __tablename__ = "compliance_policies"
    __table_args__ = (
        Index("ix_cg_pol_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    regulation: Mapped[str] = mapped_column(String(100), nullable=False)  # hipaa, gdpr, nabh, jci
    rules: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class ComplianceControl(BaseModel):
    """Specific technical or administrative control implementing a policy."""
    __tablename__ = "compliance_controls"
    __table_args__ = (
        Index("ix_cg_ctrl_pol", "tenant_id", "policy_id"),
    )

    policy_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    control_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="planned")  # planned, implemented, failed
    implemented_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class ComplianceViolation(BaseModel):
    """Detected breach of a policy or control."""
    __tablename__ = "compliance_violations"
    __table_args__ = (
        Index("ix_cg_viol_pol", "tenant_id", "policy_id"),
        Index("ix_cg_viol_sev", "tenant_id", "severity"),
    )

    policy_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    violation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")  # low, medium, high, critical
    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class ComplianceEvidence(BaseModel):
    """Proof collected for audits showing a control is working."""
    __tablename__ = "compliance_evidence"
    __table_args__ = (
        Index("ix_cg_ev_ctrl", "tenant_id", "control_id"),
    )

    control_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    evidence_type: Mapped[str] = mapped_column(String(100), nullable=False)  # system_log, configuration, signoff
    document_url: Mapped[str] = mapped_column(Text, nullable=False)
    collected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class RegulatoryReport(BaseModel):
    """Generated compliance report for a specific regulation or internal audit."""
    __tablename__ = "regulatory_reports"
    __table_args__ = (
        Index("ix_cg_rep_type", "tenant_id", "report_type"),
    )

    report_type: Mapped[str] = mapped_column(String(100), nullable=False)  # hipaa_annual, nabh_monthly
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="generating")  # generating, generated, failed
    generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
