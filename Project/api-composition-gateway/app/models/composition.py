"""
Composition Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, List, Optional

class PatientDashboard(BaseModel):
    model_config = ConfigDict(strict=True)
    patient: Dict[str, Any]
    vitals: List[Dict[str, Any]]
    conditions: List[Dict[str, Any]]
    medications: List[Dict[str, Any]]
    appointments: List[Dict[str, Any]]
    readmission_risk: Optional[Dict[str, Any]]
    consent_summary: Optional[Dict[str, Any]]

class ClinicalSummary(BaseModel):
    model_config = ConfigDict(strict=True)
    vitals: List[Dict[str, Any]]
    conditions: List[Dict[str, Any]]
    orders: List[Dict[str, Any]]
    results: List[Dict[str, Any]]
    ai_insights: Dict[str, Any]
    recent_access: List[Dict[str, Any]]

class AdminOverview(BaseModel):
    model_config = ConfigDict(strict=True)
    iam: Dict[str, Any]
    zta: Dict[str, Any]
    audit: Dict[str, Any]
    compliance: Dict[str, Any]
    ai: Dict[str, Any]
    appointments: Dict[str, Any]
