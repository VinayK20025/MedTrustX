"""
MedTrustX Bed Management Service — Pydantic v2 Schemas

Request / response DTOs for all bed management API operations.
"""
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ═══════════════════════════════════════════════════════════════
#  Bed Schemas
# ═══════════════════════════════════════════════════════════════

class BedCreate(BaseModel):
    """Register a new bed in the inventory."""
    room_id: uuid.UUID = Field(..., description="Room ID from facilities-service")
    bed_number: str = Field(..., max_length=50, description="Human-readable bed ID (e.g., ICU-A-03)")
    type: str = Field(
        default="general",
        description="general | icu | nicu | isolation | er | recovery | maternity | psychiatric",
    )
    ward: Optional[str] = Field(None, max_length=50, description="Ward or department grouping")
    floor: Optional[str] = Field(None, max_length=20, description="Floor/level")
    features: Optional[str] = Field(
        None,
        description="Comma-separated: ventilator, monitor, oxygen, suction, isolation_negative_pressure",
    )


class BedUpdate(BaseModel):
    """Update bed status or metadata."""
    status: Optional[str] = Field(
        None,
        description="available | occupied | reserved | cleaning | maintenance | blocked",
    )
    type: Optional[str] = Field(None, description="Bed type reclassification")
    ward: Optional[str] = Field(None, max_length=50)
    features: Optional[str] = Field(None)


class BedResponse(BaseModel):
    """Bed inventory item response."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    room_id: uuid.UUID
    tenant_id: uuid.UUID
    bed_number: str
    type: str
    status: str
    ward: Optional[str]
    floor: Optional[str]
    features: Optional[str]
    created_at: datetime
    updated_at: datetime


class BedDetail(BedResponse):
    """Bed with allocation and reservation history."""
    allocations: List["BedAllocationResponse"] = []
    reservations: List["BedReservationResponse"] = []


# ═══════════════════════════════════════════════════════════════
#  Bed Allocation Schemas
# ═══════════════════════════════════════════════════════════════

class BedAllocationCreate(BaseModel):
    """Allocate a bed to a patient (admission)."""
    bed_id: uuid.UUID = Field(..., description="Bed to allocate")
    patient_id: uuid.UUID = Field(..., description="Patient ID from patient-service")
    encounter_id: Optional[uuid.UUID] = Field(None, description="Clinical encounter ID")
    admission_type: str = Field(
        default="planned",
        description="planned | emergency | transfer_in | day_case",
    )
    notes: Optional[str] = Field(None, max_length=2000)


class BedAllocationUpdate(BaseModel):
    """Update allocation status (e.g., release bed on discharge)."""
    status: str = Field(
        ...,
        description="active | completed | cancelled",
    )
    notes: Optional[str] = Field(None, max_length=2000)


class BedAllocationResponse(BaseModel):
    """Bed allocation response."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    bed_id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID]
    tenant_id: uuid.UUID
    status: str
    allocated_at: datetime
    released_at: Optional[datetime]
    admission_type: Optional[str]
    notes: Optional[str]
    created_at: datetime


# ═══════════════════════════════════════════════════════════════
#  Bed Reservation Schemas
# ═══════════════════════════════════════════════════════════════

class BedReservationCreate(BaseModel):
    """Reserve a bed for an incoming patient."""
    bed_id: uuid.UUID = Field(..., description="Bed to reserve")
    reserved_for: str = Field(
        ...,
        description="scheduled_admission | er_transfer | surgical_hold | icu_step_down | external_transfer",
    )
    reference_id: Optional[uuid.UUID] = Field(
        None,
        description="Source entity ID (appointment, ER case, surgery)",
    )
    patient_id: Optional[uuid.UUID] = Field(None, description="Patient ID if known")
    expected_arrival: Optional[datetime] = Field(None, description="Expected patient arrival")
    expires_at: Optional[datetime] = Field(None, description="Auto-expiry for unfulfilled reservations")
    notes: Optional[str] = Field(None, max_length=2000)


class BedReservationUpdate(BaseModel):
    """Update reservation status."""
    status: str = Field(
        ...,
        description="pending | confirmed | fulfilled | cancelled | expired",
    )


class BedReservationResponse(BaseModel):
    """Bed reservation response."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    bed_id: uuid.UUID
    tenant_id: uuid.UUID
    reserved_for: str
    reference_id: Optional[uuid.UUID]
    patient_id: Optional[uuid.UUID]
    status: str
    reserved_at: datetime
    expected_arrival: Optional[datetime]
    expires_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime


# ═══════════════════════════════════════════════════════════════
#  Bed Transfer Schemas
# ═══════════════════════════════════════════════════════════════

class BedTransferCreate(BaseModel):
    """Transfer a patient from one bed to another."""
    from_bed_id: uuid.UUID = Field(..., description="Source bed")
    to_bed_id: uuid.UUID = Field(..., description="Destination bed")
    patient_id: uuid.UUID = Field(..., description="Patient being transferred")
    reason: Optional[str] = Field(
        None,
        description="upgrade | step_down | room_change | isolation | patient_request | maintenance_forced",
    )
    notes: Optional[str] = Field(None, max_length=2000)


class BedTransferResponse(BaseModel):
    """Bed transfer response."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    from_bed_id: uuid.UUID
    to_bed_id: uuid.UUID
    patient_id: uuid.UUID
    tenant_id: uuid.UUID
    transferred_at: datetime
    reason: Optional[str]
    initiated_by: Optional[uuid.UUID]
    notes: Optional[str]
    created_at: datetime


# ═══════════════════════════════════════════════════════════════
#  Availability & Dashboard Schemas
# ═══════════════════════════════════════════════════════════════

class WardCapacity(BaseModel):
    """Capacity summary for a single ward/department."""
    ward: str
    total: int
    available: int
    occupied: int
    reserved: int
    cleaning: int
    maintenance: int
    blocked: int
    occupancy_rate: float = Field(..., description="Percentage occupied (0.0–100.0)")


class BedAvailabilityResponse(BaseModel):
    """Hospital-wide bed availability dashboard."""
    total_beds: int
    available: int
    occupied: int
    reserved: int
    cleaning: int
    maintenance: int
    blocked: int
    overall_occupancy_rate: float
    by_ward: List[WardCapacity]
    by_type: Dict[str, Dict[str, int]]


class BedStatusLogResponse(BaseModel):
    """Bed status change log entry."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    bed_id: uuid.UUID
    old_status: Optional[str]
    new_status: str
    updated_at: datetime
    changed_by: Optional[uuid.UUID]
    reason: Optional[str]


# ── Enable forward reference resolution ────────────────────────
BedDetail.model_rebuild()
