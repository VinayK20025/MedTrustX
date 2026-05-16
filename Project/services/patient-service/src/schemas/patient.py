"""
MedTrustX Patient Service — Pydantic Request / Response Schemas

Strict validation at the API boundary. Internal layers work with
SQLAlchemy models; these schemas marshal data in/out of the service.
"""
import uuid
from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ════════════════════════════════════════════════════════════════
#  PATIENT
# ════════════════════════════════════════════════════════════════

class PatientCreate(BaseModel):
    """POST /patients — create a new patient identity."""

    first_name: str = Field(..., min_length=1, max_length=100, examples=["Ravi"])
    last_name: str = Field(..., min_length=1, max_length=100, examples=["Kumar"])
    dob: Optional[date] = Field(None, examples=["1990-05-10"])
    gender: Optional[str] = Field(
        None,
        max_length=20,
        examples=["male"],
        description="male | female | other | unknown",
    )
    blood_group: Optional[str] = Field(
        None,
        max_length=10,
        examples=["O+"],
    )
    phone: Optional[str] = Field(None, max_length=20, examples=["9876543210"])
    email: Optional[str] = Field(None, max_length=100, examples=["ravi@example.com"])
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field("IN", max_length=50)

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"male", "female", "other", "unknown"}
            if v.lower() not in allowed:
                raise ValueError(f"gender must be one of {allowed}")
            return v.lower()
        return v

    @field_validator("blood_group")
    @classmethod
    def validate_blood_group(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
            if v.upper() not in allowed:
                raise ValueError(f"blood_group must be one of {allowed}")
            return v.upper()
        return v


class PatientUpdate(BaseModel):
    """PUT /patients/{id} — partial update."""

    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    dob: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=20)
    blood_group: Optional[str] = Field(None, max_length=10)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    address_line1: Optional[str] = Field(None, max_length=255)
    address_line2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=20)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"active", "inactive", "deceased", "merged"}
            if v.lower() not in allowed:
                raise ValueError(f"status must be one of {allowed}")
            return v.lower()
        return v

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            allowed = {"male", "female", "other", "unknown"}
            if v.lower() not in allowed:
                raise ValueError(f"gender must be one of {allowed}")
            return v.lower()
        return v


class PatientIdentifierOut(BaseModel):
    """Embedded identifier in patient responses."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    value: str
    created_at: datetime


class PatientContactOut(BaseModel):
    """Embedded contact in patient responses."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    relationship_type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_primary: bool = False


class PatientResponse(BaseModel):
    """Full patient identity response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    mrn: str
    mpi_id: Optional[uuid.UUID] = None
    first_name: str
    last_name: str
    dob: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    status: str
    identifiers: List[PatientIdentifierOut] = []
    contacts: List[PatientContactOut] = []
    created_at: datetime
    updated_at: datetime


class PatientSummary(BaseModel):
    """Lightweight patient summary for lists and cross-service lookups."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: uuid.UUID
    mrn: str
    first_name: str
    last_name: str
    dob: Optional[date] = None
    gender: Optional[str] = None
    status: str


class PatientListResponse(BaseModel):
    """Paginated list response."""

    patients: List[PatientSummary]
    total: int
    skip: int
    limit: int
    tenant_id: str


# ════════════════════════════════════════════════════════════════
#  IDENTIFIERS
# ════════════════════════════════════════════════════════════════

class IdentifierCreate(BaseModel):
    """POST /patients/{id}/identifiers"""

    type: str = Field(
        ...,
        min_length=1,
        max_length=50,
        examples=["UHID"],
        description="Identifier type: MRN, UHID, AADHAAR, PASSPORT, INSURANCE",
    )
    value: str = Field(
        ...,
        min_length=1,
        max_length=100,
        examples=["UHID-2026-00123"],
    )


class IdentifierResponse(BaseModel):
    """Full identifier response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    patient_id: uuid.UUID
    tenant_id: uuid.UUID
    type: str
    value: str
    created_at: datetime


# ════════════════════════════════════════════════════════════════
#  CONTACTS
# ════════════════════════════════════════════════════════════════

class ContactCreate(BaseModel):
    """POST /patients/{id}/contacts"""

    name: str = Field(..., min_length=1, max_length=100, examples=["Priya Kumar"])
    relationship_type: Optional[str] = Field(
        None,
        max_length=50,
        examples=["spouse"],
        description="spouse | parent | sibling | child | guardian | other",
    )
    phone: Optional[str] = Field(None, max_length=20, examples=["9876543211"])
    email: Optional[str] = Field(None, max_length=100)
    is_primary: bool = Field(False, description="Primary emergency contact flag")


class ContactUpdate(BaseModel):
    """PUT /patients/{id}/contacts/{contact_id}"""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    relationship_type: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=100)
    is_primary: Optional[bool] = None


class ContactResponse(BaseModel):
    """Full contact response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    patient_id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    relationship_type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_primary: bool
    created_at: datetime


# ════════════════════════════════════════════════════════════════
#  MPI LINKING
# ════════════════════════════════════════════════════════════════

class MPILinkRequest(BaseModel):
    """POST /patients/{id}/link-mpi"""

    mpi_id: uuid.UUID = Field(
        ..., description="Master Patient Index ID from external MPI service"
    )


class MPILinkResponse(BaseModel):
    """MPI link confirmation."""

    patient_id: uuid.UUID
    mpi_id: uuid.UUID
    tenant_id: uuid.UUID
    linked_at: datetime


# ════════════════════════════════════════════════════════════════
#  SEARCH
# ════════════════════════════════════════════════════════════════

class PatientSearchParams(BaseModel):
    """Query parameters for patient search."""

    name: Optional[str] = Field(None, description="Partial name match (first or last)")
    dob: Optional[date] = Field(None, description="Exact date of birth")
    phone: Optional[str] = Field(None, description="Phone number match")
    mrn: Optional[str] = Field(None, description="Exact MRN match")
    status: Optional[str] = Field(None, description="Filter by status")
    skip: int = Field(0, ge=0)
    limit: int = Field(20, ge=1, le=100)
