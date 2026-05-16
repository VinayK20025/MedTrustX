"""
MedTrustX Digital Twin Engine Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Twins ──

class TwinCreate(BaseModel):
    entity_id: uuid.UUID
    type: str
    state: Dict[str, Any] = {}


class TwinResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    entity_id: uuid.UUID
    type: str
    state: Dict[str, Any]
    created_at: datetime


# ── State Updates ──

class StateUpdateRequest(BaseModel):
    state: Dict[str, Any]


class StateSnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    twin_id: uuid.UUID
    state: Dict[str, Any]
    created_at: datetime


# ── Simulations ──

class SimulationRequest(BaseModel):
    simulation_type: str  # predictive, stress_test, what_if


class SimulationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    twin_id: uuid.UUID
    simulation_type: str
    status: str
    started_at: datetime


# ── Events ──

class TwinEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    twin_id: uuid.UUID
    event_type: str
    payload: Dict[str, Any]
    created_at: datetime
