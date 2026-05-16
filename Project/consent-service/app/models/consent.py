"""
Consent Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class ConsentGrantRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    patient_id: str
    purpose: str
    data_elements: List[str]
    valid_until: datetime
    signature: str

class ConsentResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    id: UUID
    tenant_id: str
    patient_id: str
    purpose: str
    data_elements: List[str]
    valid_until: datetime
    status: str
    granted_at: datetime
    revoked_at: Optional[datetime]
    cryptographic_proof: Optional[str]

class VerificationRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    patient_id: str
    purpose: str
    required_elements: List[str]

class VerificationResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    is_valid: bool
    reasons: Optional[List[str]] = None
    consent_ids: Optional[List[str]] = None
