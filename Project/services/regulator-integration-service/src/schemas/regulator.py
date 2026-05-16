"""
MedTrustX Regulator Integration Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Regulators ──

class RegulatorCreate(BaseModel):
    name: str
    authority_type: str
    api_endpoint: Optional[str] = None


class RegulatorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    authority_type: str
    api_endpoint: Optional[str]
    status: str
    created_at: datetime


# ── Report Definitions ──

class ReportDefinitionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    regulator_id: uuid.UUID
    report_type: str
    schema: Dict[str, Any]
    frequency: str
    created_at: datetime


# ── Submissions ──

class SubmissionCreate(BaseModel):
    regulator_id: uuid.UUID
    report_type: str
    payload: Dict[str, Any]


class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    regulator_id: uuid.UUID
    report_type: str
    payload: Dict[str, Any]
    status: str
    submitted_at: Optional[datetime]


# ── Acknowledgments ──

class AcknowledgmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    submission_id: uuid.UUID
    ack_status: str
    response: Dict[str, Any]
    received_at: datetime
