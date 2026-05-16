"""
Report Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional

class ReportRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    report_type: str
    framework: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    format: str

class ReportResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    task_id: str
    status: str
