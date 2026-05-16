"""
MedTrustX Compliance Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict

# ── Consents ──
class ConsentCreate(BaseModel):
    patient_id: uuid.UUID
    consent_type: str
    status: str = "granted"
    granted_at: Optional[datetime] = None

class ConsentUpdate(BaseModel):
    status: str
    revoked_at: Optional[datetime] = None

class ConsentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    patient_id: uuid.UUID
    consent_type: str
    status: str
    granted_at: Optional[datetime]
    revoked_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

# ── Policies ──
class PolicyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    rules: Dict[str, Any]
    active: bool = True

class PolicyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[Dict[str, Any]] = None
    active: Optional[bool] = None

class PolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    description: Optional[str]
    rules: Dict[str, Any]
    active: bool
    created_at: datetime
    updated_at: datetime

# ── Legal Documents ──
class LegalDocumentCreate(BaseModel):
    document_type: str
    file_url: str
    version: int = 1

class LegalDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    document_type: str
    file_url: str
    version: int
    uploaded_at: datetime

# ── Compliance Checks ──
class ComplianceCheckCreate(BaseModel):
    entity_type: str
    entity_id: uuid.UUID
    status: str

class ComplianceCheckResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    status: str
    checked_at: datetime

# ── Violations ──
class ViolationCreate(BaseModel):
    violation_type: str
    description: Optional[str] = None
    severity: str
    status: str = "open"

class ViolationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    violation_type: str
    description: Optional[str]
    severity: str
    status: str
    reported_at: datetime
