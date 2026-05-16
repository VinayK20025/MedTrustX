"""
MedTrustX Loki Logging Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Ingestion ──

class LogIngestRequest(BaseModel):
    labels: Dict[str, str]
    log: str
    timestamp: Optional[datetime] = None


class LogIngestResponse(BaseModel):
    status: str
    entry_id: uuid.UUID
    stream_id: uuid.UUID


# ── Queries ──

class LogEntryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    stream_id: uuid.UUID
    labels: Dict[str, str]
    log: str
    timestamp: datetime


class LogStreamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    labels: Dict[str, str]
    created_at: datetime


class LabelListResponse(BaseModel):
    label_key: str
    values: List[str]
