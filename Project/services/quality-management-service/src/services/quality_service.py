"""
MedTrustX Quality Management Service — Business Logic Layer

Metrics ingestion, incident reporting, RCA workflow, and auditing.
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.quality import (
    Audit,
    ImprovementPlan,
    Incident,
    QualityMetric,
    RootCauseAnalysis,
)
from src.schemas.quality import (
    AuditCreate,
    ImprovementPlanCreate,
    IncidentCreate,
    QualityMetricCreate,
    RCACreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Metrics ──

async def record_metric(
    session: AsyncSession, tenant_id: uuid.UUID, data: QualityMetricCreate
) -> QualityMetric:
    metric = QualityMetric(
        tenant_id=tenant_id,
        metric_name=data.metric_name,
        value=data.value,
        context=data.context,
    )
    session.add(metric)
    await session.flush()
    await publish_event("QUALITY_METRIC_UPDATED", tenant_id, metric.id, {"metric": data.metric_name, "value": data.value})
    return metric


async def get_metrics(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 100
) -> List[QualityMetric]:
    result = await session.execute(
        select(QualityMetric).where(and_(QualityMetric.tenant_id == tenant_id, QualityMetric.deleted_at.is_(None)))
        .order_by(desc(QualityMetric.recorded_at)).limit(limit)
    )
    return list(result.scalars().all())


# ── Incidents ──

async def report_incident(
    session: AsyncSession, tenant_id: uuid.UUID, data: IncidentCreate
) -> Incident:
    incident = Incident(
        tenant_id=tenant_id,
        incident_type=data.incident_type,
        severity=data.severity,
        description=data.description,
        reporter_id=data.reporter_id,
        status="reported",
    )
    session.add(incident)
    await session.flush()

    event_name = "INCIDENT_ESCALATED" if data.severity in ("high", "critical") else "INCIDENT_REPORTED"
    await publish_event(event_name, tenant_id, incident.id, {"type": data.incident_type, "severity": data.severity})

    return incident


async def get_incident(
    session: AsyncSession, tenant_id: uuid.UUID, incident_id: uuid.UUID
) -> Optional[Incident]:
    result = await session.execute(
        select(Incident).where(and_(Incident.id == incident_id, Incident.tenant_id == tenant_id, Incident.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Root Cause Analysis (RCA) ──

async def submit_rca(
    session: AsyncSession, tenant_id: uuid.UUID, incident_id: uuid.UUID, data: RCACreate
) -> RootCauseAnalysis:
    incident = await get_incident(session, tenant_id, incident_id)
    if not incident:
        raise ValueError("Incident not found")

    rca = RootCauseAnalysis(
        tenant_id=tenant_id,
        incident_id=incident_id,
        findings=data.findings,
        actions=data.actions,
        status="completed",
        completed_at=datetime.now(timezone.utc),
    )
    session.add(rca)

    incident.status = "resolved"
    await session.flush()

    await publish_event("RCA_COMPLETED", tenant_id, rca.id, {"incident_id": str(incident_id)})
    return rca


# ── Audits ──

async def create_audit(
    session: AsyncSession, tenant_id: uuid.UUID, data: AuditCreate
) -> Audit:
    audit = Audit(
        tenant_id=tenant_id,
        audit_type=data.audit_type,
        status=data.status,
    )
    session.add(audit)
    await session.flush()
    await publish_event("AUDIT_TRIGGERED", tenant_id, audit.id, {"type": data.audit_type})
    return audit


async def get_audit(
    session: AsyncSession, tenant_id: uuid.UUID, audit_id: uuid.UUID
) -> Optional[Audit]:
    result = await session.execute(
        select(Audit).where(and_(Audit.id == audit_id, Audit.tenant_id == tenant_id, Audit.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Improvement Plans ──

async def create_improvement_plan(
    session: AsyncSession, tenant_id: uuid.UUID, data: ImprovementPlanCreate
) -> ImprovementPlan:
    plan = ImprovementPlan(
        tenant_id=tenant_id,
        plan_name=data.plan_name,
        description=data.description,
        target_metric=data.target_metric,
        status="active",
    )
    session.add(plan)
    await session.flush()
    return plan
