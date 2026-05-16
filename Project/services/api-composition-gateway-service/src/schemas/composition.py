"""
MedTrustX API Composition Gateway Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict
from pydantic import BaseModel, ConfigDict

class CompositionCreate(BaseModel):
    name: str
    definition: Dict[str, Any]

class CompositionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    definition: Dict[str, Any]
    created_at: datetime

class ComposeRequest(BaseModel):
    composition_id: uuid.UUID
    payload: Dict[str, Any] = {}

class ComposeResponse(BaseModel):
    composition_id: uuid.UUID
    status: str
    data: Dict[str, Any]
    response_time: int

class CompositionLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    composition_id: uuid.UUID
    status: str
    response_time: int
    created_at: datetime

class CompositionRouteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    path: str
    method: str
    composition_id: uuid.UUID
