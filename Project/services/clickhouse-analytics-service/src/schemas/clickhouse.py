"""
MedTrustX ClickHouse Analytics Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Ingestion ──

class EventIngestRequest(BaseModel):
    event_type: str
    payload: Dict[str, Any]
    timestamp: Optional[datetime] = None


class EventIngestResponse(BaseModel):
    status: str
    id: uuid.UUID


# ── Query & Reporting ──

class AnalyticsEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    event_type: str
    payload: Dict[str, Any]
    timestamp: datetime


class MetricSummaryResponse(BaseModel):
    metric_name: str
    avg_value: float
    min_value: float
    max_value: float
    data_points: int
