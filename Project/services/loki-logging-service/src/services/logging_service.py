"""
MedTrustX Loki Logging Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.loki import LogEntry, LogIndex, LogStream
from src.schemas.loki import (
    LabelListResponse, LogEntryResponse, LogIngestRequest, LogIngestResponse, LogStreamResponse
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Ingestion ──

async def ingest_log(
    session: AsyncSession, tenant_id: uuid.UUID, data: LogIngestRequest
) -> LogIngestResponse:
    # 1. Resolve or create stream based on labels
    # Using a simplified match logic. In real Loki, hashes are used.
    # For this abstraction, we will create a new stream if exact dict match isn't fast to find,
    # or rely on a fast lookup.
    
    stream_id = None
    # Very naive lookup for demonstration.
    result = await session.execute(
        select(LogStream).where(and_(LogStream.tenant_id == tenant_id))
    )
    for stream in result.scalars().all():
        if stream.labels == data.labels:
            stream_id = stream.id
            break
            
    if not stream_id:
        new_stream = LogStream(tenant_id=tenant_id, labels=data.labels)
        session.add(new_stream)
        await session.flush()
        stream_id = new_stream.id
        
        # Build indexes
        for k, v in data.labels.items():
            idx = LogIndex(tenant_id=tenant_id, label_key=k, label_value=v, stream_id=stream_id)
            session.add(idx)

    # 2. Append log
    entry = LogEntry(
        tenant_id=tenant_id,
        stream_id=stream_id,
        log=data.log,
        timestamp=data.timestamp or datetime.now(timezone.utc)
    )
    session.add(entry)
    await session.flush()

    # 3. Publish error events if log level is ERROR
    level = data.labels.get("level", "INFO").upper()
    if level == "ERROR":
        await publish_event("ERROR_DETECTED", tenant_id, entry.id, {"log": data.log})
    else:
        await publish_event("LOG_INGESTED", tenant_id, entry.id, {"level": level})

    return LogIngestResponse(status="ingested", entry_id=entry.id, stream_id=stream_id)


# ── Queries ──

async def query_logs(
    session: AsyncSession, tenant_id: uuid.UUID, stream_id: uuid.UUID, limit: int = 100
) -> List[LogEntryResponse]:
    result = await session.execute(
        select(LogEntry).where(
            and_(LogEntry.tenant_id == tenant_id, LogEntry.stream_id == stream_id, LogEntry.deleted_at.is_(None))
        ).order_by(LogEntry.timestamp.desc()).limit(limit)
    )
    
    entries = result.scalars().all()
    if not entries:
        return []
        
    # Get labels for the stream
    stream_res = await session.execute(select(LogStream).where(LogStream.id == stream_id))
    stream = stream_res.scalar_one()
    
    return [
        LogEntryResponse(
            id=e.id,
            stream_id=e.stream_id,
            labels=stream.labels,
            log=e.log,
            timestamp=e.timestamp
        ) for e in entries
    ]


# ── Metadata ──

async def get_streams(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[LogStreamResponse]:
    result = await session.execute(
        select(LogStream).where(and_(LogStream.tenant_id == tenant_id, LogStream.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


async def get_labels(
    session: AsyncSession, tenant_id: uuid.UUID, label_key: str
) -> LabelListResponse:
    result = await session.execute(
        select(LogIndex.label_value).where(
            and_(LogIndex.tenant_id == tenant_id, LogIndex.label_key == label_key, LogIndex.deleted_at.is_(None))
        ).distinct()
    )
    values = [r[0] for r in result.all()]
    return LabelListResponse(label_key=label_key, values=values)
