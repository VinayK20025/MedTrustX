"""
Result Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class ResultRecordRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    result_value: str
    result_unit: str
    loinc_code: str
    reference_range: str
    abnormal_flag: bool

class ResultRecord(BaseModel):
    model_config = ConfigDict(strict=True)
    id: str
    tenant_id: str
    order_id: str
    patient_id: str
    loinc_code: str
    result_value: str
    result_unit: str
    reference_range_low: Optional[float] = None
    reference_range_high: Optional[float] = None
    abnormal_flag: bool
    resulted_at: datetime
