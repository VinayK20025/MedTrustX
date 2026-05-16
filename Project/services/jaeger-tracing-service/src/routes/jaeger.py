"""
MedTrustX Jaeger Tracing Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.jaeger import (
    DependencyResponse, TraceCreate, TraceDetailResponse, TraceSummaryResponse
)
from src.services import tracing_service

router = APIRouter(tags=["Jaeger Tracing Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Ingestion ──

@router.post("/traces", response_model=TraceSummaryResponse, status_code=status.HTTP_201_CREATED)
async def ingest_trace(data: TraceCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    trace = await tracing_service.ingest_trace(session, tid, data)
    await session.commit()
    return trace


# ── Queries ──

@router.get("/traces/{trace_id}", response_model=TraceDetailResponse)
async def get_trace(trace_id: str, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    trace = await tracing_service.get_trace(session, tid, trace_id)
    if not trace:
        raise HTTPException(status_code=404, detail="Trace not found")
    return trace


# ── Topology ──

@router.get("/services", response_model=List[str])
async def get_services(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await tracing_service.get_services(session, tid)


@router.get("/dependencies", response_model=List[DependencyResponse])
async def get_dependencies(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await tracing_service.get_dependencies(session, tid)
