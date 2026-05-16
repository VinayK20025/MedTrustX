"""
MedTrustX Alert Correlation Engine Service — Business Logic Layer
"""
import hashlib
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.correlation import Alert, AlertMapping, CorrelatedIncident, SuppressionRule
from src.schemas.correlation import AlertCreate, SuppressionRuleCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


def _compute_incident_key(source: str, alert_type: str) -> str:
    """Deterministic correlation key based on source + type."""
    raw = f"{source}:{alert_type}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


# ── Alerts ──

async def ingest_alert(
    session: AsyncSession, tenant_id: uuid.UUID, data: AlertCreate
) -> Alert:
    # 1. Check suppression rules
    rules_result = await session.execute(
        select(SuppressionRule).where(
            and_(SuppressionRule.tenant_id == tenant_id, SuppressionRule.deleted_at.is_(None))
        )
    )
    rules = list(rules_result.scalars().all())
    for rule in rules:
        conditions = rule.conditions or {}
        if conditions.get("source") == data.source and conditions.get("type") == data.type:
            logger.info("alert_suppressed", source=data.source, type=data.type, rule=rule.rule_name)
            await publish_event("ALERT_SUPPRESSED", tenant_id, payload={"source": data.source, "type": data.type, "rule": rule.rule_name})
            # Still persist but mark as suppressed
            alert = Alert(tenant_id=tenant_id, source=data.source, type=data.type, severity="suppressed", payload=data.payload)
            session.add(alert)
            await session.flush()
            return alert

    # 2. Persist the alert
    alert = Alert(tenant_id=tenant_id, source=data.source, type=data.type, severity=data.severity, payload=data.payload)
    session.add(alert)
    await session.flush()

    # 3. Correlate — find or create incident
    incident_key = _compute_incident_key(data.source, data.type)
    existing = await session.execute(
        select(CorrelatedIncident).where(
            and_(
                CorrelatedIncident.tenant_id == tenant_id,
                CorrelatedIncident.incident_key == incident_key,
                CorrelatedIncident.status.in_(["open", "investigating"])
            )
        )
    )
    incident = existing.scalar_one_or_none()

    if not incident:
        incident = CorrelatedIncident(
            tenant_id=tenant_id,
            incident_key=incident_key,
            root_cause=f"{data.source}:{data.type}",
            severity=data.severity,
            status="open"
        )
        session.add(incident)
        await session.flush()
        await publish_event("INCIDENT_CORRELATED", tenant_id, incident.id, {"key": incident_key, "severity": data.severity})

    # 4. Map alert → incident
    mapping = AlertMapping(
        tenant_id=tenant_id,
        alert_id=alert.id,
        incident_id=incident.id,
        correlation_score=0.85
    )
    session.add(mapping)
    await session.flush()

    await publish_event("ROOT_CAUSE_IDENTIFIED", tenant_id, incident.id, {"root_cause": incident.root_cause})
    return alert


async def get_alert(
    session: AsyncSession, tenant_id: uuid.UUID, alert_id: uuid.UUID
) -> Alert | None:
    result = await session.execute(
        select(Alert).where(and_(Alert.id == alert_id, Alert.tenant_id == tenant_id, Alert.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Incidents ──

async def list_incidents(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[CorrelatedIncident]:
    result = await session.execute(
        select(CorrelatedIncident).where(
            and_(CorrelatedIncident.tenant_id == tenant_id, CorrelatedIncident.deleted_at.is_(None))
        ).order_by(CorrelatedIncident.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())


async def get_incident(
    session: AsyncSession, tenant_id: uuid.UUID, incident_id: uuid.UUID
) -> CorrelatedIncident | None:
    result = await session.execute(
        select(CorrelatedIncident).where(
            and_(CorrelatedIncident.id == incident_id, CorrelatedIncident.tenant_id == tenant_id)
        )
    )
    return result.scalar_one_or_none()


# ── Suppression Rules ──

async def create_rule(
    session: AsyncSession, tenant_id: uuid.UUID, data: SuppressionRuleCreate
) -> SuppressionRule:
    rule = SuppressionRule(tenant_id=tenant_id, rule_name=data.rule_name, conditions=data.conditions)
    session.add(rule)
    await session.flush()
    return rule
