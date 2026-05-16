"""
Schedule Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import datetime

class WaitlistEntry(BaseModel):
    model_config = ConfigDict(strict=True)
    patient_id: str
    provider_id: Optional[str] = None
    urgency: str
    preferred_start: datetime
    preferred_end: datetime
    reason: str

class AvailabilityQuery(BaseModel):
    model_config = ConfigDict(strict=True)
    provider_id: str
    date_start: datetime
    date_end: datetime
