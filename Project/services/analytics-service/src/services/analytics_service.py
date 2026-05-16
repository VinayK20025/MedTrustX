"""
MedTrustX Analytics Service — Business Logic Layer

Implements event ingestion with automatic metric aggregation,
report generation, ML prediction stubs, and dashboard CRUD.
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

import numpy as np
from sqlalchemy import and_, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.analytics import (
    AggregatedMetric,
    AnalyticsEvent,
    AnalyticsReport,
    Dashboard,
    Prediction,
)
from src.schemas.analytics import DashboardCreateRequest, EventIngestRequest
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Metric computation rules ──
# Maps event_type → metric_name for automatic aggregation
_AUTO_METRICS: Dict[str, str] = {
    "PATIENT_ADMITTED": "admissions_count",
    "PATIENT_DISCHARGED": "discharges_count",
    "BED_ASSIGNED": "bed_occupancy",
    "ORDER_PLACED": "orders_count",
    "APPOINTMENT_CREATED": "appointments_count",
    "ER_TRIAGE_COMPLETED": "er_triage_count",
    "ACCESS_DENIED": "access_denial_count",
    "THREAT_DETECTED": "threat_count",
}


# ── Event Ingestion ──

async def ingest_event(
    session: AsyncSession, tenant_id: uuid.UUID, data: EventIngestRequest
) -> AnalyticsEvent:
    event = AnalyticsEvent(
        tenant_id=tenant_id,
        event_type=data.event_type,
        source_service=data.source_service,
        payload=data.payload,
    )
    session.add(event)
    await session.flush()

    # Auto-aggregate if a metric rule exists
    metric_name = _AUTO_METRICS.get(data.event_type)
    if metric_name:
        await _increment_metric(session, tenant_id, metric_name, source=data.source_service)

    return event


async def _increment_metric(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    metric_name: str,
    increment: float = 1.0,
    source: str = "",
) -> None:
    metric = AggregatedMetric(
        tenant_id=tenant_id,
        metric_name=metric_name,
        value=increment,
        dimensions={"source": source},
    )
    session.add(metric)
    await session.flush()

    await publish_event(
        "METRIC_UPDATED",
        tenant_id,
        payload={"metric": metric_name, "value": increment},
    )


# ── Metrics ──

async def get_metrics(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 50
) -> List[AggregatedMetric]:
    result = await session.execute(
        select(AggregatedMetric)
        .where(and_(AggregatedMetric.tenant_id == tenant_id, AggregatedMetric.deleted_at.is_(None)))
        .order_by(desc(AggregatedMetric.recorded_at))
        .limit(limit)
    )
    return list(result.scalars().all())


# ── Reports ──

async def get_report(
    session: AsyncSession, tenant_id: uuid.UUID, report_id: uuid.UUID
) -> Optional[AnalyticsReport]:
    result = await session.execute(
        select(AnalyticsReport).where(
            and_(AnalyticsReport.id == report_id, AnalyticsReport.tenant_id == tenant_id, AnalyticsReport.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def generate_summary_report(
    session: AsyncSession, tenant_id: uuid.UUID
) -> AnalyticsReport:
    """Generate a snapshot summary report by aggregating recent metrics."""
    metrics_result = await session.execute(
        select(
            AggregatedMetric.metric_name,
            func.sum(AggregatedMetric.value).label("total"),
            func.count().label("count"),
        )
        .where(and_(AggregatedMetric.tenant_id == tenant_id, AggregatedMetric.deleted_at.is_(None)))
        .group_by(AggregatedMetric.metric_name)
    )
    rows = metrics_result.all()

    summary: Dict[str, Any] = {}
    for row in rows:
        summary[row.metric_name] = {"total": float(row.total), "samples": row.count}

    report = AnalyticsReport(
        tenant_id=tenant_id,
        report_type="summary",
        data=summary,
    )
    session.add(report)
    await session.flush()

    await publish_event("REPORT_GENERATED", tenant_id, report.id, {"type": "summary"})
    return report


# ── Predictions ──

async def get_prediction(
    session: AsyncSession, tenant_id: uuid.UUID, entity_id: uuid.UUID
) -> Optional[Prediction]:
    result = await session.execute(
        select(Prediction).where(
            and_(Prediction.tenant_id == tenant_id, Prediction.entity_id == entity_id, Prediction.deleted_at.is_(None))
        )
        .order_by(desc(Prediction.created_at))
        .limit(1)
    )
    return result.scalar_one_or_none()


async def run_prediction(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    entity_id: uuid.UUID,
    model_name: str = "risk_model_v1",
) -> Prediction:
    """Lightweight ML prediction stub using numpy."""
    risk_value = float(np.clip(np.random.beta(2, 5), 0.0, 1.0))
    label = "high_risk" if risk_value > 0.6 else ("medium_risk" if risk_value > 0.3 else "low_risk")

    pred = Prediction(
        tenant_id=tenant_id,
        model_name=model_name,
        entity_id=entity_id,
        prediction={"risk_score": round(risk_value, 4), "label": label, "model": model_name},
    )
    session.add(pred)
    await session.flush()
    return pred


# ── Dashboards ──

async def create_dashboard(
    session: AsyncSession, tenant_id: uuid.UUID, data: DashboardCreateRequest
) -> Dashboard:
    dash = Dashboard(tenant_id=tenant_id, name=data.name, config=data.config)
    session.add(dash)
    await session.flush()
    return dash


async def get_dashboard(
    session: AsyncSession, tenant_id: uuid.UUID, dash_id: uuid.UUID
) -> Optional[Dashboard]:
    result = await session.execute(
        select(Dashboard).where(
            and_(Dashboard.id == dash_id, Dashboard.tenant_id == tenant_id, Dashboard.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def list_dashboards(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[Dashboard]:
    result = await session.execute(
        select(Dashboard).where(and_(Dashboard.tenant_id == tenant_id, Dashboard.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
