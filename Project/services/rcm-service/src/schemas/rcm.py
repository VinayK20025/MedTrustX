"""
MedTrustX RCM Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Claim Items ─────────────────────────────────────────────────
class ClaimItemCreate(BaseModel):
    description: str
    amount: Decimal = Field(..., max_digits=10, decimal_places=2)


class ClaimItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    description: str
    amount: Decimal
    status: str


# ── Claims ──────────────────────────────────────────────────────
class ClaimCreate(BaseModel):
    patient_id: uuid.UUID
    invoice_id: uuid.UUID
    insurer: str = Field(..., max_length=100)
    items: List[ClaimItemCreate]


class ClaimUpdate(BaseModel):
    status: str = Field(..., description="draft | submitted | processing | adjudicated | paid | denied")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"draft", "submitted", "processing", "adjudicated", "paid", "denied"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class ClaimResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    invoice_id: uuid.UUID
    insurer: str
    claim_amount: Decimal
    status: str
    submitted_at: Optional[datetime]
    created_at: datetime
    items: List[ClaimItemResponse] = []


# ── Adjudications ───────────────────────────────────────────────
class AdjudicationCreate(BaseModel):
    approved_amount: Decimal = Field(..., max_digits=10, decimal_places=2)
    rejected_amount: Decimal = Field(..., max_digits=10, decimal_places=2)
    status: str = Field(..., description="fully_approved | partially_approved | completely_rejected")


class AdjudicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    claim_id: uuid.UUID
    approved_amount: Decimal
    rejected_amount: Decimal
    status: str
    processed_at: datetime


# ── Reimbursements ──────────────────────────────────────────────
class ReimbursementCreate(BaseModel):
    amount: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)
    payment_date: datetime


class ReimbursementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    claim_id: uuid.UUID
    amount: Decimal
    payment_date: datetime
    status: str


# ── Denials ─────────────────────────────────────────────────────
class DenialCreate(BaseModel):
    reason: str


class DenialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    claim_id: uuid.UUID
    reason: str
    status: str
    created_at: datetime
