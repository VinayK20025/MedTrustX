"""
Referral Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class ReferralCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    patient_id: str
    referring_doctor_id: str
    specialty: str
    reason: str
    urgency: str
    icd10_code: Optional[str] = None

class ReferralRecord(BaseModel):
    model_config = ConfigDict(strict=True)
    id: str
    tenant_id: str
    patient_id: str
    referring_doctor_id: str
    specialty: str
    reason: str
    urgency: str
    status: str
    icd10_code: Optional[str]
    created_at: datetime
