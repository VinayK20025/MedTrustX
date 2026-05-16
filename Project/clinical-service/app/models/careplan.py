"""
Care Plan Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, List
from datetime import date, datetime

class CarePlanCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    patient_id: str
    title: str
    description: str
    goals: List[str]
    activities: List[str]
    start_date: date
    end_date: Optional[date] = None

class CarePlanRecord(BaseModel):
    model_config = ConfigDict(strict=True)
    id: str
    tenant_id: str
    patient_id: str
    title: str
    description: str
    goals: List[str]
    activities: List[str]
    start_date: date
    end_date: Optional[date]
    status: str
    created_at: datetime
