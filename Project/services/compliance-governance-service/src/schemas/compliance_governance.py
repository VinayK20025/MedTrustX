"""
MedTrustX Compliance Governance Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Policies ──

class CompliancePolicyCreate(BaseModel):
    name: str
    regulation: str
    rules: Dict[str, Any] = {}


class CompliancePolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    regulation: str
    rules: Dict[str, Any]
    created_at: datetime


# ── Controls ──

class ComplianceControlCreate(BaseModel):
    policy_id: uuid.UUID
    control_name: str


class ComplianceControlResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    policy_id: uuid.UUID
    control_name: str
    status: str
    implemented_at: Optional[datetime]


# ── Violations ──

class ComplianceViolationCreate(BaseModel):
    policy_id: uuid.UUID
    violation_type: str
    severity: str


class ComplianceViolationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    policy_id: uuid.UUID
    violation_type: str
    severity: str
    detected_at: datetime


# ── Evidence ──

class ComplianceEvidenceCreate(BaseModel):
    control_id: uuid.UUID
    evidence_type: str
    document_url: str


class ComplianceEvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    control_id: uuid.UUID
    evidence_type: str
    document_url: str
    collected_at: datetime


# ── Reports ──

class RegulatoryReportCreate(BaseModel):
    report_type: str


class RegulatoryReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    report_type: str
    status: str
    generated_at: Optional[datetime]
