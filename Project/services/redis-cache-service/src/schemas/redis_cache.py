"""
MedTrustX Redis Cache Service — Pydantic v2 Schemas
"""
from typing import Any, Dict, Optional

from pydantic import BaseModel


# ── Cache Keys ──

class CacheSetRequest(BaseModel):
    key: str
    value: Dict[str, Any]
    ttl_seconds: Optional[int] = None


class CacheGetResponse(BaseModel):
    key: str
    value: Optional[Dict[str, Any]] = None
    exists: bool


# ── Rate Limits ──

class RateLimitCheckRequest(BaseModel):
    key: str
    limit: int
    window_seconds: int


class RateLimitCheckResponse(BaseModel):
    key: str
    allowed: bool
    current_count: int
