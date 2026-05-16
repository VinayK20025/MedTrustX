"""
MedTrustX Marketing Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field

# ── Campaigns ──
class CampaignCreate(BaseModel):
    name: str
    channel: str
    status: str = "draft"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    channel: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class CampaignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    channel: str
    status: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: datetime

# ── Campaign Targets ──
class CampaignTargetCreate(BaseModel):
    patient_id: uuid.UUID

class CampaignTargetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    campaign_id: uuid.UUID
    tenant_id: uuid.UUID
    patient_id: uuid.UUID
    status: str
    targeted_at: Optional[datetime]

# ── Segments ──
class SegmentCreate(BaseModel):
    name: str
    definition: Dict[str, Any]

class SegmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    definition: Dict[str, Any]
    created_at: datetime

# ── Engagement Events ──
class EngagementEventCreate(BaseModel):
    campaign_id: Optional[uuid.UUID] = None
    patient_id: uuid.UUID
    event_type: str
    event_metadata: Optional[Dict[str, Any]] = Field(None, alias="metadata")

class EngagementEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    id: uuid.UUID
    campaign_id: Optional[uuid.UUID]
    patient_id: uuid.UUID
    tenant_id: uuid.UUID
    event_type: str
    event_metadata: Optional[Dict[str, Any]] = Field(None, alias="metadata")
    created_at: datetime

# ── Funnels ──
class FunnelCreate(BaseModel):
    name: str
    stages: Dict[str, Any]

class FunnelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    stages: Dict[str, Any]
    created_at: datetime
