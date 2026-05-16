"""
MedTrustX Redpanda Streaming Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Topics ──

class TopicCreate(BaseModel):
    topic_name: str
    partitions: int = 1
    replication_factor: int = 1


class TopicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    topic_name: str
    partitions: int
    replication_factor: int
    created_at: datetime


# ── Production ──

class ProduceMessageRequest(BaseModel):
    topic: str
    key: Optional[str] = None
    value: Dict[str, Any]
    partition: Optional[int] = None


class ProduceMessageResponse(BaseModel):
    status: str
    topic: str
    partition: int
    offset: int
    timestamp: datetime


# ── Consumption ──

class ConsumerOffsetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    consumer_group: str
    topic: str
    partition: int
    offset: int
    updated_at: datetime
