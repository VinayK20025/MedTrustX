"""
MedTrustX MPI Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional, List, Dict

from pydantic import BaseModel, ConfigDict

# ── Master Patients ──
class MasterPatientCreate(BaseModel):
    global_identifier: str
    attributes: Optional[Dict[str, str]] = None

class MasterPatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    global_identifier: str
    created_at: datetime

# ── Linking ──
class PatientLinkCreate(BaseModel):
    master_patient_id: uuid.UUID
    source_system: str
    source_patient_id: uuid.UUID

class PatientLinkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    master_patient_id: uuid.UUID
    source_system: str
    source_patient_id: uuid.UUID
    linked_at: datetime

# ── Matching ──
class MatchRequest(BaseModel):
    patient_a: uuid.UUID
    patient_b: uuid.UUID
    match_score: int

class MatchCandidateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_a: uuid.UUID
    patient_b: uuid.UUID
    match_score: int
    status: str
    evaluated_at: datetime

# ── Merging ──
class MergeRequest(BaseModel):
    master_patient_id: uuid.UUID
    merged_patient_id: uuid.UUID

class MergeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    master_patient_id: uuid.UUID
    merged_patient_id: uuid.UUID
    merged_at: datetime
