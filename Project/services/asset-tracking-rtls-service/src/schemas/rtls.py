"""
MedTrustX Asset Tracking RTLS Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class AssetCreate(BaseModel):
    name: str
    type: str

class AssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    type: str
    status: str
    created_at: datetime

class TagCreate(BaseModel):
    asset_id: uuid.UUID
    tag_type: str
    identifier: str

class TagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    asset_id: uuid.UUID
    tag_type: str
    identifier: str
    status: str
    created_at: datetime

class LocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    asset_id: uuid.UUID
    zone: str
    coordinates: Dict[str, Any]
    timestamp: datetime

class MovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    asset_id: uuid.UUID
    from_zone: str
    to_zone: str
    created_at: datetime
