"""
MedTrustX Compliance Enforcement Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.enforcement import (
    ComplianceRule, ComplianceEvaluation, ComplianceViolation, ComplianceReport, ComplianceAction
)
from src.schemas.enforcement import (
    ComplianceRuleCreate, ComplianceRuleUpdate,
    ComplianceEvaluationRequest, ComplianceReportCreate,
    ComplianceActionCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Compliance Rules ──

async def create_rule(
    session: AsyncSession, tenant_id: uuid.UUID, data: ComplianceRuleCreate
) -> ComplianceRule:
    rule = ComplianceRule(
        tenant_id=tenant_id,
        name=data.name,
        rule_definition=data.rule_definition,
        active=data.active,
    )
    session.add(rule)
    await session.flush()
    return rule

async def get_rule(
    session: AsyncSession, tenant_id: uuid.UUID, rule_id: uuid.UUID
) -> Optional[ComplianceRule]:
    result = await session.execute(
        select(ComplianceRule).where(and_(ComplianceRule.id == rule_id, ComplianceRule.tenant_id == tenant_id, ComplianceRule.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_rule(
    session: AsyncSession, tenant_id: uuid.UUID, rule_id: uuid.UUID, data: ComplianceRuleUpdate
) -> Optional[ComplianceRule]:
    rule = await get_rule(session, tenant_id, rule_id)
    if not rule:
        return None
        
    if data.name:
        rule.name = data.name
    if data.rule_definition is not None:
        rule.rule_definition = data.rule_definition
    if data.active is not None:
        rule.active = data.active
        
    rule.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return rule

# ── Compliance Evaluations ──

async def evaluate(
    session: AsyncSession, tenant_id: uuid.UUID, data: ComplianceEvaluationRequest
) -> ComplianceEvaluation:
    # A real engine would parse rule definitions and score them here.
    # For now, we stub an evaluation logic based on mock presence of violation triggers.
    is_compliant = "violation" not in data.context_data.get("action", "").lower()
    score = 100 if is_compliant else 30
    result_str = "pass" if is_compliant else "fail"
    
    evaluation = ComplianceEvaluation(
        tenant_id=tenant_id,
        entity_type=data.entity_type,
        entity_id=data.entity_id,
        result=result_str,
        score=score,
    )
    session.add(evaluation)
    await session.flush()
    
    await publish_event("COMPLIANCE_CHECK_COMPLETED", tenant_id, evaluation.id, {
        "entity_type": data.entity_type, "result": result_str, "score": score
    })
    
    if not is_compliant:
        violation = ComplianceViolation(
            tenant_id=tenant_id,
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            violation_type="runtime_rule_failure",
            severity="high",
        )
        session.add(violation)
        await session.flush()
        
        await publish_event("VIOLATION_DETECTED", tenant_id, violation.id, {
            "entity_type": violation.entity_type,
            "entity_id": str(violation.entity_id),
            "severity": violation.severity,
        })
        
    return evaluation

# ── Compliance Violations ──

async def get_violations(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[ComplianceViolation]:
    result = await session.execute(
        select(ComplianceViolation).where(and_(ComplianceViolation.tenant_id == tenant_id, ComplianceViolation.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

async def get_violation(
    session: AsyncSession, tenant_id: uuid.UUID, violation_id: uuid.UUID
) -> Optional[ComplianceViolation]:
    result = await session.execute(
        select(ComplianceViolation).where(and_(ComplianceViolation.id == violation_id, ComplianceViolation.tenant_id == tenant_id, ComplianceViolation.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Compliance Reports ──

async def create_report(
    session: AsyncSession, tenant_id: uuid.UUID, data: ComplianceReportCreate
) -> ComplianceReport:
    report = ComplianceReport(
        tenant_id=tenant_id,
        report_type=data.report_type,
        data=data.data,
    )
    session.add(report)
    await session.flush()
    return report

async def get_report(
    session: AsyncSession, tenant_id: uuid.UUID, report_id: uuid.UUID
) -> Optional[ComplianceReport]:
    result = await session.execute(
        select(ComplianceReport).where(and_(ComplianceReport.id == report_id, ComplianceReport.tenant_id == tenant_id, ComplianceReport.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Compliance Actions ──

async def create_action(
    session: AsyncSession, tenant_id: uuid.UUID, data: ComplianceActionCreate
) -> ComplianceAction:
    action = ComplianceAction(
        tenant_id=tenant_id,
        violation_id=data.violation_id,
        action_type=data.action_type,
        status="pending",
    )
    session.add(action)
    await session.flush()
    return action
