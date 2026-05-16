"""
MedTrustX Clinical Research Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

from pydantic import BaseModel, ConfigDict


# ── Studies ──

class StudyCreateRequest(BaseModel):
    name: str
    study_type: str = "observational"
    protocol: Dict[str, Any] = {}


class StudyUpdateRequest(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    protocol: Optional[Dict[str, Any]] = None


class StudyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    study_type: str
    status: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    protocol: Dict[str, Any]


# ── Participants ──

class ParticipantEnrollRequest(BaseModel):
    patient_id: uuid.UUID


class ParticipantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    study_id: uuid.UUID
    patient_id: uuid.UUID
    status: str
    enrolled_at: datetime


# ── Cohorts ──

class CohortCreateRequest(BaseModel):
    name: str
    criteria: Dict[str, Any] = {}


class CohortResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    criteria: Dict[str, Any]


# ── Research Data ──

class ResearchDataCollectRequest(BaseModel):
    study_id: uuid.UUID
    patient_id: uuid.UUID
    data: Dict[str, Any] = {}


class ResearchDataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    study_id: uuid.UUID
    patient_id: uuid.UUID
    data: Dict[str, Any]
    collected_at: datetime


# ── Study Events ──

class StudyEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    study_id: uuid.UUID
    event_type: str
    payload: Dict[str, Any]
    created_at: datetime
