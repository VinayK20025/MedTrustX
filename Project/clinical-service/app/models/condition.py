"""
Condition Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import date, datetime

class ConditionCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    patient_id: str
    icd10_code: Optional[str] = None
    snomed_code: Optional[str] = None
    description: str
    onset_date: date
    severity: str

class ConditionRecord(BaseModel):
    model_config = ConfigDict(strict=True)
    id: str
    tenant_id: str
    patient_id: str
    icd10_code: Optional[str]
    snomed_code: Optional[str]
    description: str
    onset_date: date
    severity: str
    status: str
    comorbidity_score: Optional[int] = None
    created_at: datetime
