"""
MedTrustX Emergency (ER) Service — Pydantic v2 Schemas

Request / response DTOs for all ER API operations.
Validated at the API boundary, serialized via Pydantic v2 ConfigDict.
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ═══════════════════════════════════════════════════════════════
#  Emergency Case Schemas
# ═══════════════════════════════════════════════════════════════

class EmergencyCaseCreate(BaseModel):
    """Create a new emergency case (patient arrival)."""
    patient_id: uuid.UUID = Field(..., description="Patient ID from patient-service")
    severity_level: str = Field(
        default="medium",
        description="critical | high | medium | low | non_urgent",
    )
    chief_complaint: Optional[str] = Field(
        None, max_length=2000,
        description="Brief initial complaint at registration",
    )
    mode_of_arrival: str = Field(
        default="walk_in",
        description="ambulance | walk_in | referred | police | helicopter",
    )
    er_unit: Optional[str] = Field(
        None, max_length=50,
        description="Multi-ER unit identifier (e.g., ER-A, Trauma Bay)",
    )


class EmergencyCaseUpdate(BaseModel):
    """Update emergency case status / disposition."""
    status: Optional[str] = Field(
        None,
        description="registered | triaged | in_treatment | discharged | admitted | transferred | deceased",
    )
    severity_level: Optional[str] = Field(
        None,
        description="critical | high | medium | low | non_urgent",
    )
    assigned_doctor: Optional[uuid.UUID] = Field(
        None,
        description="Primary attending physician ID",
    )
    disposition: Optional[str] = Field(
        None,
        description="discharged_home | admitted_ward | admitted_icu | transferred | lama | deceased",
    )
    er_unit: Optional[str] = Field(
        None, max_length=50,
        description="Transfer to different ER unit",
    )


class EmergencyCaseResponse(BaseModel):
    """Full emergency case response with metadata."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    patient_id: uuid.UUID
    tenant_id: uuid.UUID
    arrival_time: datetime
    severity_level: str
    status: str
    assigned_doctor: Optional[uuid.UUID]
    chief_complaint: Optional[str]
    mode_of_arrival: Optional[str]
    er_unit: Optional[str]
    discharge_time: Optional[datetime]
    disposition: Optional[str]
    created_at: datetime
    updated_at: datetime


class EmergencyCaseDetail(EmergencyCaseResponse):
    """Emergency case with nested triage records, assignments, and events."""
    triage_records: List["TriageRecordResponse"] = []
    assignments: List["ERAssignmentResponse"] = []
    events: List["EREventResponse"] = []


class EmergencyCaseList(BaseModel):
    """Paginated list of emergency cases."""
    items: List[EmergencyCaseResponse]
    total: int
    page: int
    page_size: int


# ═══════════════════════════════════════════════════════════════
#  Triage Schemas
# ═══════════════════════════════════════════════════════════════

class VitalsSchema(BaseModel):
    """Structured vitals for triage assessment."""
    heart_rate: Optional[int] = Field(None, ge=0, le=300, description="BPM")
    bp_systolic: Optional[int] = Field(None, ge=0, le=300, description="mmHg")
    bp_diastolic: Optional[int] = Field(None, ge=0, le=200, description="mmHg")
    temperature: Optional[float] = Field(None, ge=25.0, le=45.0, description="°C")
    spo2: Optional[int] = Field(None, ge=0, le=100, description="Oxygen saturation %")
    respiratory_rate: Optional[int] = Field(None, ge=0, le=80, description="Breaths/min")
    gcs: Optional[int] = Field(None, ge=3, le=15, description="Glasgow Coma Scale")
    pain_score: Optional[int] = Field(None, ge=0, le=10, description="Pain scale 0-10")


class TriageRecordCreate(BaseModel):
    """Perform triage on an emergency case."""
    symptoms: str = Field(
        ..., min_length=5, max_length=5000,
        description="Free-text symptom description from triage nurse",
    )
    vitals: Optional[VitalsSchema] = Field(
        None,
        description="Structured vitals measurement",
    )
    priority_score: int = Field(
        ..., ge=1, le=5,
        description="1 = resuscitation, 2 = emergent, 3 = urgent, 4 = less urgent, 5 = non-urgent",
    )
    triage_category: Optional[str] = Field(
        None,
        description="resuscitation | emergent | urgent | less_urgent | non_urgent",
    )
    notes: Optional[str] = Field(
        None, max_length=5000,
        description="Additional clinical observations during triage",
    )


class TriageRecordResponse(BaseModel):
    """Triage record response."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    case_id: uuid.UUID
    symptoms: str
    vitals: Optional[Dict[str, Any]]
    priority_score: int
    triage_category: Optional[str]
    triaged_by: Optional[uuid.UUID]
    triaged_at: datetime
    notes: Optional[str]
    created_at: datetime


# ═══════════════════════════════════════════════════════════════
#  Assignment Schemas
# ═══════════════════════════════════════════════════════════════

class ERAssignmentCreate(BaseModel):
    """Assign staff to an emergency case."""
    staff_id: uuid.UUID = Field(..., description="Staff member ID from IAM service")
    role: str = Field(
        ...,
        description="attending_doctor | resident | er_nurse | specialist | paramedic",
    )


class ERAssignmentResponse(BaseModel):
    """Staff assignment response."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    case_id: uuid.UUID
    staff_id: uuid.UUID
    role: str
    assigned_at: datetime
    unassigned_at: Optional[datetime]
    is_active: bool


# ═══════════════════════════════════════════════════════════════
#  Event Schemas
# ═══════════════════════════════════════════════════════════════

class EREventCreate(BaseModel):
    """Log an event against an emergency case."""
    event_type: str = Field(
        ...,
        description=(
            "CASE_REGISTERED | TRIAGE_COMPLETED | DOCTOR_ASSIGNED | "
            "TREATMENT_STARTED | VITALS_UPDATED | ESCALATED | "
            "TRANSFERRED | DISCHARGED | ADMITTED | NOTE_ADDED | STATUS_CHANGED"
        ),
    )
    description: Optional[str] = Field(
        None, max_length=5000,
        description="Human-readable event description",
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Structured event payload for downstream consumers",
    )


class EREventResponse(BaseModel):
    """Event log entry response."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    case_id: uuid.UUID
    event_type: str
    description: Optional[str]
    metadata: Optional[Dict[str, Any]]
    actor_id: Optional[uuid.UUID]
    created_at: datetime


# ═══════════════════════════════════════════════════════════════
#  Queue Schemas
# ═══════════════════════════════════════════════════════════════

class ERQueueEntryResponse(BaseModel):
    """Single queue entry with case summary."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    case_id: uuid.UUID
    priority: int
    status: str
    wait_start: datetime
    updated_at: datetime
    # Denormalized fields from the case for queue display
    case: Optional[EmergencyCaseResponse] = None


class ERQueueResponse(BaseModel):
    """Full priority-ordered ER queue."""
    entries: List[ERQueueEntryResponse]
    total_waiting: int
    total_in_treatment: int


# ── Enable forward reference resolution ────────────────────────
EmergencyCaseDetail.model_rebuild()
