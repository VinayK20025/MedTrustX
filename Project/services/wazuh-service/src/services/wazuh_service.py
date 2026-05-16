"""
MedTrustX Wazuh Shim Service — Business Logic Layer
"""
import uuid
from typing import List, Optional

from sqlalchemy import select, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.wazuh import WazuhAlert, WazuhLog, WazuhRule
from src.schemas.wazuh import RuleCreateRequest, LogIngestRequest
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Alerts ──

async def get_alerts(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[WazuhAlert]:
    result = await session.execute(
        select(WazuhAlert)
        .where(and_(WazuhAlert.tenant_id == tenant_id, WazuhAlert.deleted_at.is_(None)))
        .order_by(desc(WazuhAlert.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())

async def get_alert(
    session: AsyncSession, tenant_id: uuid.UUID, alert_id: str
) -> Optional[WazuhAlert]:
    try:
        aid = uuid.UUID(alert_id)
    except ValueError:
        return None
        
    result = await session.execute(
        select(WazuhAlert).where(and_(WazuhAlert.id == aid, WazuhAlert.tenant_id == tenant_id, WazuhAlert.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Rules ──

async def create_rule(
    session: AsyncSession, tenant_id: uuid.UUID, data: RuleCreateRequest
) -> WazuhRule:
    # Rule IDs in Wazuh are usually global, but we scope to tenant for the shim if needed,
    # or treat them as global config if tenant_id is the admin tenant. For now, scoped.
    
    rule = WazuhRule(
        tenant_id=tenant_id,
        rule_id=data.rule_id,
        description=data.description,
        level=data.level,
        match_conditions=data.match_conditions
    )
    session.add(rule)
    await session.flush()
    return rule

async def get_rules(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[WazuhRule]:
    result = await session.execute(
        select(WazuhRule).where(and_(WazuhRule.tenant_id == tenant_id, WazuhRule.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

# ── Event Ingestion & Analysis ──

async def ingest_event(
    session: AsyncSession, tenant_id: uuid.UUID, data: LogIngestRequest
) -> WazuhLog:
    # 1. Store the raw log
    log_entry = WazuhLog(
        tenant_id=tenant_id,
        service_name=data.service_name,
        event_type=data.event_type,
        log_data=data.log_data
    )
    session.add(log_entry)
    await session.flush()
    
    # 2. Basic rule evaluation simulation
    rules_result = await session.execute(select(WazuhRule).where(WazuhRule.deleted_at.is_(None)))
    rules = rules_result.scalars().all()
    
    for rule in rules:
        # Extremely simplified matching logic for shim
        match = True
        for k, v in rule.match_conditions.items():
            if k == "event_type" and data.event_type != v:
                match = False
            if k in data.log_data and data.log_data[k] != v:
                match = False
                
        if match:
            severity = "low"
            if rule.level >= 12: severity = "critical"
            elif rule.level >= 8: severity = "high"
            elif rule.level >= 4: severity = "medium"
            
            alert = WazuhAlert(
                tenant_id=tenant_id,
                rule_id=rule.rule_id,
                severity=severity,
                description=f"Rule {rule.rule_id} triggered: {rule.description}",
                event_data=data.log_data
            )
            session.add(alert)
            await session.flush()
            
            await publish_event(
                "THREAT_DETECTED", 
                tenant_id, 
                alert.id, 
                {"rule_id": rule.rule_id, "severity": severity, "service": data.service_name}
            )

    return log_entry

async def get_events(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[WazuhLog]:
    result = await session.execute(
        select(WazuhLog)
        .where(and_(WazuhLog.tenant_id == tenant_id, WazuhLog.deleted_at.is_(None)))
        .order_by(desc(WazuhLog.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())
