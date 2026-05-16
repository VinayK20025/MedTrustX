"""
MedTrustX Consent Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any

from pydantic import BaseModel, ConfigDict

# ── Consents ──
class ConsentCreate(BaseModel):
    patient_id: uuid.UUID
    consent_type: str
    scope: Dict[str, Any]
    expires_at: Optional[datetime] = None
    document_url: Optional[str] = None
    performed_by: uuid.UUID

class ConsentUpdate(BaseModel):
    scope: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None
    performed_by: uuid.UUID

class ConsentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    tenant_id: uuid.UUID
    consent_type: str
    scope: Dict[str, Any]
    status: str
    granted_at: datetime
    revoked_at: Optional[datetime]
    expires_at: Optional[datetime]

# ── Validation ──
class ValidationRequest(BaseModel):
    patient_id: uuid.UUID
    resource: str
    action: str
    consent_type: str

class ValidationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    patient_id: uuid.UUID
    resource: str
    action: str
    consent_valid: bool
    reason: Optional[str] = None

# ── Logs ──
class ConsentLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    consent_id: uuid.UUID
    action: str
    performed_by: uuid.UUID
    timestamp: datetime
