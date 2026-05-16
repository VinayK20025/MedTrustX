"""
MedTrustX Clinical Service — Pydantic Schemas

Data transfer objects for clinical records.
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Observations ────────────────────────────────────────────────
class ObservationCreate(BaseModel):
    type: str = Field(..., max_length=50, examples=["BLOOD_PRESSURE", "HEART_RATE", "TEMPERATURE"])
    value: str = Field(..., max_length=50, examples=["120/80", "72", "98.6"])
    unit: Optional[str] = Field(None, max_length=20, examples=["mmHg", "bpm", "F"])
    recorded_at: Optional[datetime] = None

class ObservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    encounter_id: uuid.UUID
    patient_id: uuid.UUID
    type: str
    value: str
    unit: Optional[str] = None
    recorded_at: datetime
    created_by: uuid.UUID


# ── Diagnoses ───────────────────────────────────────────────────
class DiagnosisCreate(BaseModel):
    icd_code: Optional[str] = Field(None, max_length=20, examples=["I10", "E11.9"])
    description: str = Field(..., examples=["Essential (primary) hypertension"])
    type: str = Field("primary", max_length=20, description="primary | secondary | provisional | differential")
    status: str = Field("active", max_length=20, description="active | resolved | chronic")

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"primary", "secondary", "provisional", "differential"}
        if v.lower() not in allowed:
            raise ValueError(f"type must be one of {allowed}")
        return v.lower()
        
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"active", "resolved", "chronic"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()

class DiagnosisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    encounter_id: uuid.UUID
    patient_id: uuid.UUID
    icd_code: Optional[str] = None
    description: str
    type: str
    status: str
    created_by: uuid.UUID
    created_at: datetime


# ── Clinical Notes ──────────────────────────────────────────────
class ClinicalNoteCreate(BaseModel):
    subjective: Optional[str] = Field(None, description="Patient's reported symptoms")
    objective: Optional[str] = Field(None, description="Clinical findings, physical exam")
    assessment: Optional[str] = Field(None, description="Medical diagnosis or assessment")
    plan: Optional[str] = Field(None, description="Treatment plan, medications ordered")

class ClinicalNoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    encounter_id: uuid.UUID
    patient_id: uuid.UUID
    subjective: Optional[str] = None
    objective: Optional[str] = None
    assessment: Optional[str] = None
    plan: Optional[str] = None
    created_by: uuid.UUID
    created_at: datetime


# ── Encounters ──────────────────────────────────────────────────
class EncounterCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_type: str = Field(..., max_length=20, examples=["OPD", "IPD", "ER", "TELEMED"])
    attending_physician: Optional[uuid.UUID] = None

    @field_validator("encounter_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"OPD", "IPD", "ER", "TELEMED"}
        if v.upper() not in allowed:
            raise ValueError(f"encounter_type must be one of {allowed}")
        return v.upper()

class EncounterUpdate(BaseModel):
    status: Optional[str] = Field(None, description="active | closed | cancelled")
    attending_physician: Optional[uuid.UUID] = None
    ended_at: Optional[datetime] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"active", "closed", "cancelled"}
            if v.lower() not in allowed:
                raise ValueError(f"status must be one of {allowed}")
            return v.lower()
        return v

class EncounterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    tenant_id: uuid.UUID
    encounter_type: str
    status: str
    attending_physician: Optional[uuid.UUID] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

class EncounterDetailResponse(EncounterResponse):
    """Full encounter details including notes, diagnoses, and observations."""
    notes: List[ClinicalNoteResponse] = []
    diagnoses: List[DiagnosisResponse] = []
    observations: List[ObservationResponse] = []


# ── History ─────────────────────────────────────────────────────
class PatientHistoryResponse(BaseModel):
    """Longitudinal history of a patient."""
    patient_id: uuid.UUID
    tenant_id: uuid.UUID
    encounters: List[EncounterDetailResponse]
