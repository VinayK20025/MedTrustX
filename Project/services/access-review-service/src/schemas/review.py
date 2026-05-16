"""
MedTrustX Access Review Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

# ── Campaigns ──
class CampaignCreate(BaseModel):
    name: str
    scope: str

class CampaignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    scope: str
    status: str
    started_at: datetime
    ended_at: Optional[datetime]

class ReviewItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    campaign_id: uuid.UUID
    user_id: uuid.UUID
    role_id: uuid.UUID
    status: str
    reviewed_at: Optional[datetime]

# ── Certifications ──
class CertificationCreate(BaseModel):
    review_item_id: uuid.UUID
    reviewer_id: uuid.UUID
    decision: str
    comments: Optional[str] = None

class CertificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    review_item_id: uuid.UUID
    reviewer_id: uuid.UUID
    decision: str
    comments: Optional[str]
    decided_at: datetime

# ── Anomalies ──
class AnomalyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    anomaly_type: str
    severity: str
    detected_at: datetime

# ── Revocations ──
class RevocationCreate(BaseModel):
    user_id: uuid.UUID
    role_id: uuid.UUID
    reason: str

class RevocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    role_id: uuid.UUID
    reason: str
    revoked_at: datetime
