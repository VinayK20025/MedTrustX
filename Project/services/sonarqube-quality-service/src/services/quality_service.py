"""
MedTrustX SonarQube Quality Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.sonarqube import Analysis, CodeIssue, Project, QualityGate
from src.schemas.sonarqube import AnalysisCreate, ProjectCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Projects ──

async def create_project(
    session: AsyncSession, tenant_id: uuid.UUID, data: ProjectCreate
) -> Project:
    project = Project(
        tenant_id=tenant_id,
        repo_id=data.repo_id,
        name=data.name
    )
    session.add(project)
    await session.flush()
    return project


async def get_project(
    session: AsyncSession, tenant_id: uuid.UUID, project_id: uuid.UUID
) -> Project | None:
    result = await session.execute(
        select(Project).where(
            and_(Project.id == project_id, Project.tenant_id == tenant_id, Project.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── Analyses ──

async def run_analysis(
    session: AsyncSession, tenant_id: uuid.UUID, data: AnalysisCreate
) -> Analysis:
    # Simulate analysis: in production, this triggers SonarQube scanner via webhook
    analysis = Analysis(
        tenant_id=tenant_id,
        project_id=data.project_id,
        status="success",
        score=85.0  # Simulated quality score
    )
    session.add(analysis)
    await session.flush()

    # Auto-evaluate quality gate
    gate_status = "passed" if analysis.score >= 80.0 else "failed"
    gate = QualityGate(
        tenant_id=tenant_id,
        project_id=data.project_id,
        status=gate_status,
        evaluated_at=datetime.now(timezone.utc)
    )
    session.add(gate)
    await session.flush()

    event_type = "QUALITY_GATE_PASSED" if gate_status == "passed" else "QUALITY_GATE_FAILED"
    await publish_event("ANALYSIS_COMPLETED", tenant_id, analysis.id, {"score": analysis.score, "status": "success"})
    await publish_event(event_type, tenant_id, gate.id, {"project_id": str(data.project_id), "gate_status": gate_status})

    return analysis


# ── Issues ──

async def get_project_issues(
    session: AsyncSession, tenant_id: uuid.UUID, project_id: uuid.UUID
) -> List[CodeIssue]:
    result = await session.execute(
        select(CodeIssue).where(
            and_(CodeIssue.tenant_id == tenant_id, CodeIssue.project_id == project_id, CodeIssue.deleted_at.is_(None))
        ).order_by(CodeIssue.created_at.desc())
    )
    return list(result.scalars().all())


# ── Quality Gates ──

async def get_quality_gate(
    session: AsyncSession, tenant_id: uuid.UUID, project_id: uuid.UUID
) -> QualityGate | None:
    result = await session.execute(
        select(QualityGate).where(
            and_(QualityGate.tenant_id == tenant_id, QualityGate.project_id == project_id, QualityGate.deleted_at.is_(None))
        ).order_by(QualityGate.evaluated_at.desc())
    )
    return result.scalars().first()
