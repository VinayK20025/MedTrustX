"""
MedTrustX Compliance Enforcement Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from sqlalchemy import Boolean, DateTime, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class ComplianceRule(BaseModel):
    __tablename__ = "compliance_rules"
    __table_args__ = (
        Index("ix_comp_rules_tenant_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    rule_definition: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default=text("true"))


class ComplianceEvaluation(BaseModel):
    __tablename__ = "compliance_evaluations"
    __table_args__ = (
        Index("ix_comp_evals_tenant_entity", "tenant_id", "entity_id"),
        Index("ix_comp_evals_evaluated_at", "evaluated_at"),
    )

    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    result: Mapped[str] = mapped_column(String(20), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default=text("0"))
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class ComplianceViolation(BaseModel):
    __tablename__ = "compliance_violations"
    __table_args__ = (
        Index("ix_comp_viol_tenant_entity", "tenant_id", "entity_id"),
        Index("ix_comp_viol_status_sev", "status", "severity"),
    )

    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    violation_type: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open", server_default=text("'open'"))
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class ComplianceReport(BaseModel):
    __tablename__ = "compliance_reports"

    report_type: Mapped[str] = mapped_column(String(50), nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)
    data: Mapped[Dict[str, Any]] = mapped_column(JSONB, nullable=False)


class ComplianceAction(BaseModel):
    __tablename__ = "compliance_actions"

    violation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default=text("'pending'"))
    executed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
