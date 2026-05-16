"""
Vitals Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class VitalPoint(BaseModel):
    model_config = ConfigDict(strict=True)
    type: str
    value: float
    unit: str
    recorded_at: Optional[datetime] = None

class VitalsIngestRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    patient_id: str
    vitals: List[VitalPoint]

class VitalsIngestionResult(BaseModel):
    model_config = ConfigDict(strict=True)
    ingested_count: int
    anomalies: List[Dict[str, Any]]
