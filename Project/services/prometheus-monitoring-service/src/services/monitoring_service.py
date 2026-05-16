"""
MedTrustX Prometheus Monitoring Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.prometheus import AlertEvent, AlertRule, MetricSeries
from src.schemas.prometheus import (
    AlertEventResponse, AlertRuleCreate, MetricSeriesResponse, TargetResponse
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Metrics ──

async def get_metrics(
    session: AsyncSession, tenant_id: uuid.UUID, metric_name: str = None, limit: int = 50
) -> List[MetricSeriesResponse]:
    query = select(MetricSeries).where(
        and_(MetricSeries.tenant_id == tenant_id, MetricSeries.deleted_at.is_(None))
    )
    if metric_name:
        query = query.where(MetricSeries.metric_name == metric_name)
        
    query = query.order_by(MetricSeries.timestamp.desc()).limit(limit)
    result = await session.execute(query)
    
    return [
        MetricSeriesResponse(
            metric_name=m.metric_name,
            labels=m.labels,
            value=m.value,
            timestamp=m.timestamp
        ) for m in result.scalars().all()
    ]


# ── Alerts ──

async def create_alert_rule(
    session: AsyncSession, tenant_id: uuid.UUID, data: AlertRuleCreate
) -> AlertRule:
    rule = AlertRule(
        tenant_id=tenant_id,
        rule_name=data.rule_name,
        expression=data.expression,
        severity=data.severity
    )
    session.add(rule)
    await session.flush()
    await publish_event("ALERT_RULE_CREATED", tenant_id, rule.id, {"rule_name": data.rule_name})
    return rule


async def get_active_alerts(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[AlertEventResponse]:
    result = await session.execute(
        select(AlertEvent).where(
            and_(AlertEvent.tenant_id == tenant_id, AlertEvent.status == "firing", AlertEvent.deleted_at.is_(None))
        ).order_by(AlertEvent.triggered_at.desc())
    )
    return [
        AlertEventResponse(
            id=a.id,
            rule_id=a.rule_id,
            status=a.status,
            triggered_at=a.triggered_at
        ) for a in result.scalars().all()
    ]


# ── Targets ──

async def get_targets(tenant_id: uuid.UUID) -> List[TargetResponse]:
    # Mock representation of Prometheus Target status endpoint
    return [
        TargetResponse(
            target_url="http://api-gateway:3000/metrics",
            status="up",
            last_scraped_at=datetime.now(timezone.utc)
        ),
        TargetResponse(
            target_url="http://emr-service:8000/metrics",
            status="up",
            last_scraped_at=datetime.now(timezone.utc)
        )
    ]
