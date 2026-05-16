"""
MedTrustX Mortuary Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── Records ──

class MortuaryRecordCreate(BaseModel):
    patient_id: uuid.UUID
    date_of_death: datetime
    cause: Optional[str] = None


class MortuaryRecordResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    date_of_death: datetime
    cause: Optional[str]
    status: str
    created_at: datetime


# ── Storage Units ──

class StorageUnitCreate(BaseModel):
    unit_number: str
    capacity: int = 1


class StorageUnitResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    unit_number: str
    capacity: int
    status: str
    created_at: datetime


# ── Allocations ──

class BodyAllocationCreate(BaseModel):
    mortuary_record_id: uuid.UUID
    storage_unit_id: uuid.UUID


class BodyAllocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    mortuary_record_id: uuid.UUID
    storage_unit_id: uuid.UUID
    allocated_at: datetime


# ── Custody Logs ──

class CustodyLogCreate(BaseModel):
    mortuary_record_id: uuid.UUID
    action: str
    performed_by: uuid.UUID


class CustodyLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    mortuary_record_id: uuid.UUID
    action: str
    performed_by: uuid.UUID
    performed_at: datetime


# ── Releases ──

class ReleaseCreate(BaseModel):
    mortuary_record_id: uuid.UUID
    released_to: str


class ReleaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    mortuary_record_id: uuid.UUID
    released_to: str
    released_at: datetime
    status: str
