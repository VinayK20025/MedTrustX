"""
Gap Analysis Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from app.models.control import FrameworkControl

class RemediationItem(BaseModel):
    model_config = ConfigDict(strict=True)
    control_id: str
    recommendation: str

class GapReport(BaseModel):
    model_config = ConfigDict(strict=True)
    framework: str
    tenant_id: str
    analysis_date: str
    total_controls: int
    implemented: int
    partial: int
    not_implemented: int
    not_applicable: int
    compliance_percentage: float
    critical_gaps: List[FrameworkControl]
    remediation_roadmap: List[RemediationItem]

class MultiFrameworkGapReport(BaseModel):
    model_config = ConfigDict(strict=True)
    tenant_id: str
    reports: List[GapReport]
