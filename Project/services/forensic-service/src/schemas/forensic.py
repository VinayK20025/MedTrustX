"""
MedTrustX Forensic Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── MLC Cases ──

class MLCCaseCreate(BaseModel):
    patient_id: uuid.UUID
    case_type: str


class MLCCaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    case_type: str
    status: str
    registered_at: datetime


# ── Evidence Items ──

class EvidenceItemCreate(BaseModel):
    mlc_case_id: uuid.UUID
    item_type: str
    description: str


class EvidenceItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    mlc_case_id: uuid.UUID
    item_type: str
    description: str
    collected_at: datetime


# ── Custody Logs ──

class CustodyLogCreate(BaseModel):
    evidence_id: uuid.UUID
    action: str
    performed_by: uuid.UUID


class CustodyLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    evidence_id: uuid.UUID
    action: str
    performed_by: uuid.UUID
    performed_at: datetime


# ── Forensic Reports ──

class ForensicReportCreate(BaseModel):
    mlc_case_id: uuid.UUID
    findings: str


class ForensicReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    mlc_case_id: uuid.UUID
    findings: str
    created_at: datetime


# ── External Requests ──

class ExternalRequestCreate(BaseModel):
    mlc_case_id: uuid.UUID
    authority: str
    request_type: str


class ExternalRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    mlc_case_id: uuid.UUID
    authority: str
    request_type: str
    status: str
    requested_at: datetime
