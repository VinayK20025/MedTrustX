"""
MedTrustX Simulation & What-If Engine Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict

from pydantic import BaseModel, ConfigDict


# ── Simulations ──

class SimulationCreate(BaseModel):
    name: str
    type: str  # what_if, predictive, stress_test, policy_impact


class SimulationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    type: str
    status: str
    created_at: datetime


# ── Scenarios ──

class ScenarioCreate(BaseModel):
    parameters: Dict[str, Any]


class ScenarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    simulation_id: uuid.UUID
    parameters: Dict[str, Any]
    created_at: datetime


# ── Results ──

class SimulationResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    simulation_id: uuid.UUID
    result: Dict[str, Any]
    generated_at: datetime


# ── Events ──

class SimulationEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    simulation_id: uuid.UUID
    event_type: str
    payload: Dict[str, Any]
    created_at: datetime
