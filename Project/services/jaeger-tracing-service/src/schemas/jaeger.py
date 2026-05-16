"""
MedTrustX Jaeger Tracing Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


# ── Spans ──

class SpanCreate(BaseModel):
    trace_id: str
    span_id: str
    parent_span_id: Optional[str] = None
    operation_name: str
    duration: int
    started_at: datetime


class SpanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    span_id: str
    parent_span_id: Optional[str] = None
    operation_name: str
    duration: int
    started_at: datetime


# ── Traces ──

class TraceCreate(BaseModel):
    trace_id: str
    service_name: str
    duration: int
    started_at: datetime
    spans: List[SpanCreate]


class TraceSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    trace_id: str
    service_name: str
    duration: int
    started_at: datetime


class TraceDetailResponse(TraceSummaryResponse):
    spans: List[SpanResponse]


# ── Dependencies ──

class DependencyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    parent_service: str
    child_service: str
    call_count: int
