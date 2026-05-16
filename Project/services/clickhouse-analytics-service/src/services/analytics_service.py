"""
MedTrustX ClickHouse Analytics Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.clickhouse import AnalyticsEvent, DeviceMetric
from src.schemas.clickhouse import (
    AnalyticsEventResponse, EventIngestRequest, EventIngestResponse, MetricSummaryResponse
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Ingestion ──

async def ingest_event(
    session: AsyncSession, tenant_id: uuid.UUID, data: EventIngestRequest
) -> EventIngestResponse:
    ts = data.timestamp or datetime.now(timezone.utc)
    
    event = AnalyticsEvent(
        tenant_id=tenant_id,
        event_type=data.event_type,
        payload=data.payload,
        timestamp=ts
    )
    session.add(event)
    await session.flush()
    
    # Normally this would stream directly to ClickHouse Native interface or Kafka Sink
    await publish_event("ANALYTICS_PROCESSED", tenant_id, event.id, {"event_type": data.event_type})

    return EventIngestResponse(status="ingested", id=event.id)


# ── Queries ──

async def get_recent_events(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[AnalyticsEventResponse]:
    result = await session.execute(
        select(AnalyticsEvent)
        .where(and_(AnalyticsEvent.tenant_id == tenant_id, AnalyticsEvent.deleted_at.is_(None)))
        .order_by(AnalyticsEvent.timestamp.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_metrics_summary(
    session: AsyncSession, tenant_id: uuid.UUID, metric_name: str
) -> MetricSummaryResponse:
    result = await session.execute(
        select(
            func.avg(DeviceMetric.metric_value).label("avg_value"),
            func.min(DeviceMetric.metric_value).label("min_value"),
            func.max(DeviceMetric.metric_value).label("max_value"),
            func.count(DeviceMetric.id).label("data_points")
        ).where(
            and_(DeviceMetric.tenant_id == tenant_id, DeviceMetric.metric_name == metric_name, DeviceMetric.deleted_at.is_(None))
        )
    )
    row = result.first()
    
    return MetricSummaryResponse(
        metric_name=metric_name,
        avg_value=float(row.avg_value) if row and row.avg_value else 0.0,
        min_value=float(row.min_value) if row and row.min_value else 0.0,
        max_value=float(row.max_value) if row and row.max_value else 0.0,
        data_points=int(row.data_points) if row and row.data_points else 0
    )
