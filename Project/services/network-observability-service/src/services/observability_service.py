"""
MedTrustX Network Observability Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.net_observability import Anomaly, Dependency, NetworkFlow, TrafficMetric
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def list_flows(session: AsyncSession, tenant_id: uuid.UUID) -> List[NetworkFlow]:
    result = await session.execute(
        select(NetworkFlow).where(
            and_(NetworkFlow.tenant_id == tenant_id, NetworkFlow.deleted_at.is_(None))
        ).order_by(NetworkFlow.timestamp.desc()).limit(100)
    )
    return list(result.scalars().all())


async def list_metrics(session: AsyncSession, tenant_id: uuid.UUID) -> List[TrafficMetric]:
    result = await session.execute(
        select(TrafficMetric).where(
            and_(TrafficMetric.tenant_id == tenant_id, TrafficMetric.deleted_at.is_(None))
        ).order_by(TrafficMetric.timestamp.desc()).limit(100)
    )
    return list(result.scalars().all())


async def list_dependencies(session: AsyncSession, tenant_id: uuid.UUID) -> List[Dependency]:
    result = await session.execute(
        select(Dependency).where(
            and_(Dependency.tenant_id == tenant_id, Dependency.deleted_at.is_(None))
        )
    )
    return list(result.scalars().all())


async def list_anomalies(session: AsyncSession, tenant_id: uuid.UUID) -> List[Anomaly]:
    result = await session.execute(
        select(Anomaly).where(
            and_(Anomaly.tenant_id == tenant_id, Anomaly.deleted_at.is_(None))
        ).order_by(Anomaly.created_at.desc()).limit(50)
    )
    return list(result.scalars().all())
