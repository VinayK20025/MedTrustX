"""
MedTrustX Pharmacy Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Administration ────────────────────────────────────────────────
class AdministrationCreate(BaseModel):
    status: str = Field("given", description="given | missed | delayed")
    notes: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"given", "missed", "delayed"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()

class AdministrationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    prescription_item_id: uuid.UUID
    patient_id: uuid.UUID
    administered_by: uuid.UUID
    administered_at: datetime
    status: str
    notes: Optional[str] = None


# ── Dispense ────────────────────────────────────────────────────
class DispenseCreate(BaseModel):
    quantity: int = Field(..., gt=0, description="Total units dispensed")

class DispenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    prescription_item_id: uuid.UUID
    quantity: int
    dispensed_by: uuid.UUID
    dispensed_at: datetime


# ── Prescription Items ──────────────────────────────────────────
class PrescriptionItemCreate(BaseModel):
    drug_name: str = Field(..., max_length=100)
    dosage: str = Field(..., max_length=50)
    frequency: str = Field(..., max_length=50)
    duration: str = Field(..., max_length=50)
    route: str = Field(..., max_length=50)
    instructions: Optional[str] = None

class PrescriptionItemUpdate(BaseModel):
    status: str = Field(..., description="pending | dispensed | completed")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"pending", "dispensed", "completed"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()

class PrescriptionItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    prescription_id: uuid.UUID
    drug_name: str
    dosage: str
    frequency: str
    duration: str
    route: str
    instructions: Optional[str] = None
    status: str
    created_at: datetime


class PrescriptionItemDetailResponse(PrescriptionItemResponse):
    dispenses: List[DispenseResponse] = []
    administrations: List[AdministrationResponse] = []


# ── Prescriptions ───────────────────────────────────────────────
class PrescriptionCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    items: List[PrescriptionItemCreate]

class PrescriptionUpdate(BaseModel):
    status: str = Field(..., description="active | completed | cancelled")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"active", "completed", "cancelled"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()

class PrescriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    tenant_id: uuid.UUID
    prescribed_by: uuid.UUID
    status: str
    created_at: datetime
    updated_at: datetime


class PrescriptionDetailResponse(PrescriptionResponse):
    items: List[PrescriptionItemDetailResponse] = []


# ── History ─────────────────────────────────────────────────────
class PatientMedicationHistoryResponse(BaseModel):
    patient_id: uuid.UUID
    tenant_id: uuid.UUID
    prescriptions: List[PrescriptionDetailResponse]
