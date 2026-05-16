"""
MedTrustX Jaeger Tracing Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.jaeger import Dependency, Span, Trace
from src.schemas.jaeger import (
    DependencyResponse, SpanResponse, TraceCreate,
    TraceDetailResponse, TraceSummaryResponse
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Ingestion ──

async def ingest_trace(
    session: AsyncSession, tenant_id: uuid.UUID, data: TraceCreate
) -> TraceSummaryResponse:
    # 1. Insert Trace Metadata
    trace = Trace(
        tenant_id=tenant_id,
        trace_id=data.trace_id,
        service_name=data.service_name,
        duration=data.duration,
        started_at=data.started_at
    )
    session.add(trace)

    # 2. Insert Spans
    for span_data in data.spans:
        span = Span(
            tenant_id=tenant_id,
            trace_id=data.trace_id,
            span_id=span_data.span_id,
            parent_span_id=span_data.parent_span_id,
            operation_name=span_data.operation_name,
            duration=span_data.duration,
            started_at=span_data.started_at
        )
        session.add(span)

    await session.flush()
    await publish_event("TRACE_RECORDED", tenant_id, trace.id, {"trace_id": data.trace_id})

    return TraceSummaryResponse(
        trace_id=trace.trace_id,
        service_name=trace.service_name,
        duration=trace.duration,
        started_at=trace.started_at
    )


# ── Queries ──

async def get_trace(
    session: AsyncSession, tenant_id: uuid.UUID, trace_id: str
) -> TraceDetailResponse | None:
    # 1. Get trace
    res_trace = await session.execute(
        select(Trace).where(and_(Trace.tenant_id == tenant_id, Trace.trace_id == trace_id, Trace.deleted_at.is_(None)))
    )
    trace = res_trace.scalar_one_or_none()
    if not trace:
        return None

    # 2. Get spans
    res_spans = await session.execute(
        select(Span).where(and_(Span.tenant_id == tenant_id, Span.trace_id == trace_id, Span.deleted_at.is_(None)))
    )
    spans = res_spans.scalars().all()

    return TraceDetailResponse(
        trace_id=trace.trace_id,
        service_name=trace.service_name,
        duration=trace.duration,
        started_at=trace.started_at,
        spans=[
            SpanResponse(
                span_id=s.span_id,
                parent_span_id=s.parent_span_id,
                operation_name=s.operation_name,
                duration=s.duration,
                started_at=s.started_at
            ) for s in spans
        ]
    )


# ── Metadata & Topology ──

async def get_services(session: AsyncSession, tenant_id: uuid.UUID) -> List[str]:
    result = await session.execute(
        select(Trace.service_name).where(and_(Trace.tenant_id == tenant_id, Trace.deleted_at.is_(None))).distinct()
    )
    return [r[0] for r in result.all()]


async def get_dependencies(session: AsyncSession, tenant_id: uuid.UUID) -> List[DependencyResponse]:
    result = await session.execute(
        select(Dependency).where(and_(Dependency.tenant_id == tenant_id, Dependency.deleted_at.is_(None)))
    )
    return [
        DependencyResponse(
            parent_service=d.parent_service,
            child_service=d.child_service,
            call_count=d.call_count
        ) for d in result.scalars().all()
    ]
