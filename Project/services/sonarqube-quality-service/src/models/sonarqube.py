"""
MedTrustX SonarQube Quality Service — Domain Entities

Postgres abstractions for code analysis projects, results, and quality gates.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, String, Text, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Project(BaseModel):
    """A code analysis project linked to a Gitea repository."""
    __tablename__ = "projects"
    __table_args__ = (
        Index("ix_sonar_project_tenant", "tenant_id", "name"),
    )

    repo_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)


class Analysis(BaseModel):
    """A single analysis run against a project."""
    __tablename__ = "analyses"
    __table_args__ = (
        Index("ix_sonar_analysis_project", "tenant_id", "project_id"),
        Index("ix_sonar_analysis_status", "status"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending, running, success, failed
    score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)


class CodeIssue(BaseModel):
    """Individual code quality issues discovered during analysis."""
    __tablename__ = "issues"
    __table_args__ = (
        Index("ix_sonar_issue_project", "tenant_id", "project_id"),
        Index("ix_sonar_issue_severity", "severity"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)  # blocker, critical, major, minor, info
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # bug, vulnerability, code_smell
    description: Mapped[str] = mapped_column(Text, nullable=False)


class QualityGate(BaseModel):
    """Pass/fail evaluation of a project against defined thresholds."""
    __tablename__ = "quality_gates"
    __table_args__ = (
        Index("ix_sonar_qg_project", "tenant_id", "project_id"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # passed, failed, pending
    evaluated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False
    )
