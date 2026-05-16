"""
MedTrustX Loki Logging Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.loki import (
    LabelListResponse, LogEntryResponse, LogIngestRequest,
    LogIngestResponse, LogStreamResponse
)
from src.services import logging_service

router = APIRouter(tags=["Loki Logging Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Ingestion ──

@router.post("/logs/ingest", response_model=LogIngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_log(data: LogIngestRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    resp = await logging_service.ingest_log(session, tid, data)
    await session.commit()
    return resp


# ── Queries ──

@router.get("/logs/query", response_model=List[LogEntryResponse])
async def query_logs(
    stream_id: uuid.UUID,
    request: Request,
    limit: int = Query(100, le=1000),
    session: AsyncSession = Depends(get_session)
):
    tid = _get_tenant_id(request)
    return await logging_service.query_logs(session, tid, stream_id, limit)


# ── Metadata ──

@router.get("/logs/streams", response_model=List[LogStreamResponse])
async def get_streams(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await logging_service.get_streams(session, tid)


@router.get("/logs/labels", response_model=LabelListResponse)
async def get_labels(label_key: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await logging_service.get_labels(session, tid, label_key)
