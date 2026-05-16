"""
MedTrustX Accreditation Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── Accreditation Programs ──

class ProgramCreate(BaseModel):
    name: str
    authority: str
    expires_at: Optional[datetime] = None


class ProgramResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    authority: str
    status: str
    started_at: datetime
    expires_at: Optional[datetime]


# ── Standards ──

class StandardCreate(BaseModel):
    program_id: uuid.UUID
    code: str
    description: str


class StandardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    program_id: uuid.UUID
    code: str
    description: str


# ── Checklists ──

class ChecklistCreate(BaseModel):
    standard_id: uuid.UUID
    item: str


class ChecklistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    standard_id: uuid.UUID
    item: str
    status: str


# ── Evidence ──

class EvidenceCreate(BaseModel):
    checklist_id: uuid.UUID
    document_url: str
    uploaded_by: uuid.UUID


class EvidenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    checklist_id: uuid.UUID
    document_url: str
    uploaded_by: uuid.UUID
    uploaded_at: datetime


# ── Audits ──

class AccreditationAuditCreate(BaseModel):
    program_id: uuid.UUID
    audit_type: str


class AccreditationAuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    program_id: uuid.UUID
    audit_type: str
    status: str
    conducted_at: Optional[datetime]
    findings: Optional[str]
