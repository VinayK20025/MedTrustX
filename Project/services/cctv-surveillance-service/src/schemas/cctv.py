"""
MedTrustX CCTV & Surveillance Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

class CameraCreate(BaseModel):
    name: str
    location: str

class CameraResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    location: str
    status: str
    created_at: datetime

class StreamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    camera_id: uuid.UUID
    stream_url: str
    status: str
    created_at: datetime

class RecordingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    camera_id: uuid.UUID
    file_path: str
    start_time: datetime
    end_time: datetime

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    id: uuid.UUID
    camera_id: uuid.UUID
    event_type: str
    metadata_json: Dict[str, Any] = Field(alias="metadata")
    created_at: datetime
