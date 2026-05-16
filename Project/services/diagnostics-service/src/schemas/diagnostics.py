"""
MedTrustX Diagnostics Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Samples ─────────────────────────────────────────────────────
class SampleCreate(BaseModel):
    sample_type: str = Field(..., max_length=50, examples=["blood", "urine", "tissue", "swab"])
    barcode: Optional[str] = Field(None, max_length=50)

class SampleUpdate(BaseModel):
    status: str = Field(..., description="collected | received | rejected")
    barcode: Optional[str] = Field(None, max_length=50)
    rejection_reason: Optional[str] = Field(None, max_length=255)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"collected", "received", "rejected"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()

class SampleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    order_id: uuid.UUID
    sample_type: str
    barcode: Optional[str] = None
    collected_at: Optional[datetime] = None
    collected_by: Optional[uuid.UUID] = None
    status: str
    rejection_reason: Optional[str] = None


# ── Results ─────────────────────────────────────────────────────
class ResultCreate(BaseModel):
    parameter_name: str = Field(..., max_length=100)
    value: str = Field(..., max_length=50)
    unit: Optional[str] = Field(None, max_length=20)
    reference_range: Optional[str] = Field(None, max_length=100)
    is_abnormal: bool = Field(False)
    status: str = Field("preliminary", description="preliminary | final")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"preliminary", "final", "amended"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()

class ResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    order_id: uuid.UUID
    patient_id: uuid.UUID
    parameter_name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    is_abnormal: bool
    status: str
    validated_by: Optional[uuid.UUID] = None
    validated_at: Optional[datetime] = None
    created_at: datetime


# ── Imaging ─────────────────────────────────────────────────────
class ImagingResultCreate(BaseModel):
    image_url: Optional[str] = None
    report: Optional[str] = None
    status: str = Field("draft", description="draft | final")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"draft", "final", "amended"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()

class ImagingResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    order_id: uuid.UUID
    patient_id: uuid.UUID
    image_url: Optional[str] = None
    report: Optional[str] = None
    radiologist_id: Optional[uuid.UUID] = None
    status: str
    created_at: datetime


# ── Orders ──────────────────────────────────────────────────────
class DiagnosticOrderCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    order_type: str = Field(..., description="lab | imaging | pathology")
    test_name: str = Field(..., max_length=100)
    priority: str = Field("routine", description="routine | urgent | stat")

    @field_validator("order_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"lab", "imaging", "pathology"}
        if v.lower() not in allowed:
            raise ValueError(f"order_type must be one of {allowed}")
        return v.lower()

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        allowed = {"routine", "urgent", "stat"}
        if v.lower() not in allowed:
            raise ValueError(f"priority must be one of {allowed}")
        return v.lower()

class DiagnosticOrderUpdate(BaseModel):
    status: str = Field(..., description="collected | processing | completed | cancelled")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"ordered", "collected", "processing", "completed", "cancelled"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()

class DiagnosticOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    tenant_id: uuid.UUID
    order_type: str
    status: str
    test_name: str
    ordered_by: uuid.UUID
    priority: str
    created_at: datetime
    updated_at: datetime

class DiagnosticOrderDetailResponse(DiagnosticOrderResponse):
    samples: List[SampleResponse] = []
    results: List[ResultResponse] = []
    imaging_results: List[ImagingResultResponse] = []


# ── History ─────────────────────────────────────────────────────
class PatientDiagnosticsHistoryResponse(BaseModel):
    patient_id: uuid.UUID
    tenant_id: uuid.UUID
    orders: List[DiagnosticOrderDetailResponse]
