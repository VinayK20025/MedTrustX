"""
MedTrustX Medical Records Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Record Documents ────────────────────────────────────────────
class RecordDocumentCreate(BaseModel):
    file_url: str = Field(..., max_length=2000)
    file_type: str = Field(..., max_length=50)
    file_size_bytes: Optional[int] = None


class RecordDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    record_id: uuid.UUID
    file_url: str
    file_type: str
    file_size_bytes: Optional[int] = None
    uploaded_at: datetime
    uploaded_by: uuid.UUID


# ── Medical Records ─────────────────────────────────────────────
class MedicalRecordCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    record_type: str = Field(..., max_length=50)
    source_service: str = Field(..., max_length=50)
    reference_id: uuid.UUID
    title: str = Field(..., max_length=255)
    summary_data: Optional[Dict[str, Any]] = None
    documents: Optional[List[RecordDocumentCreate]] = None


class MedicalRecordUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    summary_data: Optional[Dict[str, Any]] = None


class MedicalRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    record_type: str
    source_service: str
    reference_id: uuid.UUID
    title: str
    summary_data: Optional[Dict[str, Any]] = None
    version: int
    created_at: datetime
    documents: List[RecordDocumentResponse] = []


# ── Audit Logs ──────────────────────────────────────────────────
class RecordAuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    record_id: uuid.UUID
    action: str
    performed_by: uuid.UUID
    ip_address: Optional[str] = None
    created_at: datetime
