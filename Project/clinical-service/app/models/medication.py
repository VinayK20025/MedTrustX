"""
Medication Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class PrescriptionRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    patient_id: str
    medication_code: str
    dose: str
    frequency: str
    duration: str
    prescriber_id: str
    override_reason: Optional[str] = None

class PrescriptionResult(BaseModel):
    model_config = ConfigDict(strict=True)
    prescription_id: Optional[str] = None
    status: str
    cds_alerts: List[Dict[str, Any]]
    
class MedicationRecord(BaseModel):
    model_config = ConfigDict(strict=True)
    id: str
    tenant_id: str
    patient_id: str
    medication_code: str
    dose: str
    frequency: str
    duration: str
    status: str
    prescriber_id: str
    prescribed_at: datetime
