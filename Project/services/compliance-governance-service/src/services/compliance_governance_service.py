"""
MedTrustX Compliance Governance Service — Business Logic Layer

Policies, controls, violations, evidence, and reporting orchestration.
"""
import uuid
from typing import List, Optional
from datetime import datetime, timezone

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.compliance_governance import (
    ComplianceControl,
    ComplianceEvidence,
    CompliancePolicy,
    ComplianceViolation,
    RegulatoryReport,
)
from src.schemas.compliance_governance import (
    ComplianceControlCreate,
    ComplianceEvidenceCreate,
    CompliancePolicyCreate,
    ComplianceViolationCreate,
    RegulatoryReportCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Policies ──

async def create_policy(
    session: AsyncSession, tenant_id: uuid.UUID, data: CompliancePolicyCreate
) -> CompliancePolicy:
    policy = CompliancePolicy(
        tenant_id=tenant_id,
        name=data.name,
        regulation=data.regulation,
        rules=data.rules,
    )
    session.add(policy)
    await session.flush()
    return policy


async def get_policy(
    session: AsyncSession, tenant_id: uuid.UUID, policy_id: uuid.UUID
) -> Optional[CompliancePolicy]:
    result = await session.execute(
        select(CompliancePolicy).where(and_(CompliancePolicy.id == policy_id, CompliancePolicy.tenant_id == tenant_id, CompliancePolicy.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Controls ──

async def create_control(
    session: AsyncSession, tenant_id: uuid.UUID, data: ComplianceControlCreate
) -> ComplianceControl:
    control = ComplianceControl(
        tenant_id=tenant_id,
        policy_id=data.policy_id,
        control_name=data.control_name,
        status="planned",
    )
    session.add(control)
    await session.flush()
    return control


async def get_control(
    session: AsyncSession, tenant_id: uuid.UUID, control_id: uuid.UUID
) -> Optional[ComplianceControl]:
    result = await session.execute(
        select(ComplianceControl).where(and_(ComplianceControl.id == control_id, ComplianceControl.tenant_id == tenant_id, ComplianceControl.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Violations ──

async def record_violation(
    session: AsyncSession, tenant_id: uuid.UUID, data: ComplianceViolationCreate
) -> ComplianceViolation:
    violation = ComplianceViolation(
        tenant_id=tenant_id,
        policy_id=data.policy_id,
        violation_type=data.violation_type,
        severity=data.severity,
    )
    session.add(violation)
    await session.flush()
    await publish_event("COMPLIANCE_VIOLATION_DETECTED", tenant_id, violation.id, {"severity": data.severity})
    return violation


async def get_violations(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[ComplianceViolation]:
    result = await session.execute(
        select(ComplianceViolation).where(and_(ComplianceViolation.tenant_id == tenant_id, ComplianceViolation.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Evidence ──

async def upload_evidence(
    session: AsyncSession, tenant_id: uuid.UUID, data: ComplianceEvidenceCreate
) -> ComplianceEvidence:
    evidence = ComplianceEvidence(
        tenant_id=tenant_id,
        control_id=data.control_id,
        evidence_type=data.evidence_type,
        document_url=data.document_url,
    )
    session.add(evidence)
    
    # Auto-update control status
    control = await get_control(session, tenant_id, data.control_id)
    if control and control.status != "implemented":
        control.status = "implemented"
        control.implemented_at = datetime.now(timezone.utc)
        await publish_event("CONTROL_UPDATED", tenant_id, control.id, {"status": "implemented"})

    await session.flush()
    return evidence


# ── Reports ──

async def generate_report(
    session: AsyncSession, tenant_id: uuid.UUID, data: RegulatoryReportCreate
) -> RegulatoryReport:
    report = RegulatoryReport(
        tenant_id=tenant_id,
        report_type=data.report_type,
        status="generated",
        generated_at=datetime.now(timezone.utc),
    )
    session.add(report)
    await session.flush()
    await publish_event("REPORT_GENERATED", tenant_id, report.id, {"type": data.report_type})
    return report


async def get_reports(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[RegulatoryReport]:
    result = await session.execute(
        select(RegulatoryReport).where(and_(RegulatoryReport.tenant_id == tenant_id, RegulatoryReport.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
