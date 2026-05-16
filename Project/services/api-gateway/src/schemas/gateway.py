"""
MedTrustX Internal API Gateway — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Routes ──────────────────────────────────────────────────────
class GatewayRouteCreate(BaseModel):
    service_name: str = Field(..., max_length=100)
    path: str = Field(..., max_length=200)
    method: str = Field(default="*", max_length=10)
    upstream_url: str
    active: bool = True


class GatewayRouteUpdate(BaseModel):
    service_name: Optional[str] = Field(None, max_length=100)
    path: Optional[str] = Field(None, max_length=200)
    method: Optional[str] = Field(None, max_length=10)
    upstream_url: Optional[str] = None
    active: Optional[bool] = None


class GatewayRouteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    service_name: str
    path: str
    method: str
    upstream_url: str
    active: bool
    created_at: datetime


# ── Policies ────────────────────────────────────────────────────
class GatewayPolicyCreate(BaseModel):
    policy_type: str = Field(..., max_length=50)
    config: Dict[str, Any]
    applied_to: str = Field(..., max_length=100)


class GatewayPolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    policy_type: str
    config: Dict[str, Any]
    applied_to: str
    created_at: datetime


# ── Rate Limits ─────────────────────────────────────────────────
class GatewayRateLimitCreate(BaseModel):
    key: str = Field(..., max_length=100)
    limit_per_min: int = Field(..., gt=0)
    burst: int = Field(default=10, ge=0)


class GatewayRateLimitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    key: str
    limit_per_min: int
    burst: int
    created_at: datetime
