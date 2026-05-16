"""
Appointment Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class AppointmentCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    patient_id: str
    provider_id: str
    appointment_type: str
    start_time: datetime
    end_time: datetime
    reason: str
    location: Optional[str] = None
    force_overbook: Optional[bool] = False

class AppointmentUpdateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    status: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    reason: Optional[str] = None
    location: Optional[str] = None

class AppointmentRecord(BaseModel):
    model_config = ConfigDict(strict=True)
    id: str
    tenant_id: str
    patient_id: str
    provider_id: str
    appointment_type: str
    start_time: datetime
    end_time: datetime
    status: str
    reason: str
    location: Optional[str]
    created_at: datetime
    updated_at: datetime
