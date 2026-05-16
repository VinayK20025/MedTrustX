"""
MedTrustX Resource Optimization Engine Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Resources ──

class ResourceCreate(BaseModel):
    resource_type: str
    status: str = "available"
    metadata: Dict[str, Any] = {}


class ResourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    resource_type: str
    status: str
    metadata: Dict[str, Any]
    created_at: datetime


# ── Allocations ──

class AllocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    resource_id: uuid.UUID
    assigned_to: uuid.UUID
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    created_at: datetime


# ── Optimization ──

class OptimizeRequest(BaseModel):
    run_type: str  # capacity_planning, scheduling, rebalancing


class OptimizationRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    run_type: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime


class OptimizationResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    run_id: uuid.UUID
    result: Dict[str, Any]
    created_at: datetime
