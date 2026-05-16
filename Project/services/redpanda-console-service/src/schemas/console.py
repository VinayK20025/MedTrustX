"""
MedTrustX Redpanda Console Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Topics ──

class TopicSummary(BaseModel):
    topic_name: str
    partition_count: int = 0
    message_count: int = 0


class TopicMessageResponse(BaseModel):
    topic_name: str
    partition: int
    offset: int
    key: Optional[str] = None
    value: Dict[str, Any]
    timestamp: datetime


# ── Consumer Groups ──

class ConsumerGroupSummary(BaseModel):
    group_name: str
    member_count: int = 0
    total_lag: int = 0


class ConsumerGroupDetail(ConsumerGroupSummary):
    topics: List[str] = []
    state: str = "stable"
