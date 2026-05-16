"""
MedTrustX Incident Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Incidents ──

class IncidentCreate(BaseModel):
    incident_type: str
    severity: str
    source: str


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    incident_type: str
    severity: str
    status: str
    source: str
    created_at: datetime


# ── Incident Updates ──

class IncidentUpdateCreate(BaseModel):
    status: str
    notes: str


class IncidentUpdateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    incident_id: uuid.UUID
    status: str
    notes: str
    updated_by: uuid.UUID
    updated_at: datetime


# ── Assignments ──

class IncidentAssignmentCreate(BaseModel):
    assigned_to: uuid.UUID


class IncidentAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    incident_id: uuid.UUID
    assigned_to: uuid.UUID
    assigned_at: datetime


# ── Playbooks ──

class PlaybookCreate(BaseModel):
    name: str
    steps: List[Dict[str, Any]]


class PlaybookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    steps: List[Dict[str, Any]]
    created_at: datetime


# ── Root Cause Analysis (RCA) ──

class RootCauseAnalysisCreate(BaseModel):
    findings: str
    actions: str


class RootCauseAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    incident_id: uuid.UUID
    findings: str
    actions: str
    completed_at: datetime
