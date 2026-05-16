"""
MedTrustX Strategic Planning Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class PlanCreate(BaseModel):
    name: str
    horizon: str

class PlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    horizon: str
    status: str
    created_at: datetime

class ObjectiveCreate(BaseModel):
    plan_id: uuid.UUID
    objective_name: str
    target_value: float

class ObjectiveResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plan_id: uuid.UUID
    objective_name: str
    target_value: float
    created_at: datetime

class InitiativeCreate(BaseModel):
    plan_id: uuid.UUID
    initiative_name: str

class InitiativeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plan_id: uuid.UUID
    initiative_name: str
    status: str
    created_at: datetime

class ForecastResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    plan_id: uuid.UUID
    metric_name: str
    predicted_value: float
    created_at: datetime
