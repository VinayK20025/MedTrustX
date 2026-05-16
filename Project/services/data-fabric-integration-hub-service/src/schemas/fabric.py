"""
MedTrustX Data Fabric / Integration Hub Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict
from pydantic import BaseModel, ConfigDict

class PipelineCreate(BaseModel):
    name: str
    source: str
    destination: str

class PipelineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    source: str
    destination: str
    status: str
    created_at: datetime

class TransformationCreate(BaseModel):
    pipeline_id: uuid.UUID
    mapping: Dict[str, Any]

class TransformationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    pipeline_id: uuid.UUID
    mapping: Dict[str, Any]
    created_at: datetime

class SchemaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    schema_name: str
    definition: Dict[str, Any]
    version: int
    created_at: datetime

class IntegrationEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    pipeline_id: uuid.UUID
    event_type: str
    payload: Dict[str, Any]
    created_at: datetime
