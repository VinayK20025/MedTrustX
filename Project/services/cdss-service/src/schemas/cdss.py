"""
MedTrustX CDSS Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Rules ───────────────────────────────────────────────────────
class CDSSRuleCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    rule_type: str = Field(..., max_length=50)
    definition: Dict[str, Any]
    active: bool = True


class CDSSRuleUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    rule_type: Optional[str] = Field(None, max_length=50)
    definition: Optional[Dict[str, Any]] = None
    active: Optional[bool] = None


class CDSSRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: Optional[str]
    rule_type: str
    definition: Dict[str, Any]
    active: bool
    created_at: datetime


# ── Alerts ──────────────────────────────────────────────────────
class CDSSAlertCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    alert_type: str = Field(..., max_length=100)
    severity: str = Field(..., description="info | warning | critical")
    message: str

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        allowed = {"info", "warning", "critical"}
        if v.lower() not in allowed:
            raise ValueError(f"severity must be one of {allowed}")
        return v.lower()


class CDSSAlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID]
    alert_type: str
    severity: str
    message: str
    status: str
    triggered_at: datetime
    resolved_at: Optional[datetime] = None


# ── Recommendations ─────────────────────────────────────────────
class CDSSRecommendationCreate(BaseModel):
    patient_id: uuid.UUID
    recommendation: str
    source: str = Field(..., max_length=50)
    confidence_score: float = Field(..., ge=0.0, le=1.0)


class CDSSRecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    recommendation: str
    source: str
    confidence_score: float
    created_at: datetime


# ── Evaluations ─────────────────────────────────────────────────
class CDSSEvaluateRequest(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    context: Dict[str, Any] = Field(..., description="Vitals, labs, meds used for inference")


class CDSSEvaluateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    input_data: Dict[str, Any]
    result: Dict[str, Any]
    evaluated_at: datetime
