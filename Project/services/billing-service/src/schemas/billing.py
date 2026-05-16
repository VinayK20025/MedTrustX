"""
MedTrustX Billing Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Charges ─────────────────────────────────────────────────────
class ChargeCreate(BaseModel):
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID] = None
    service_type: str = Field(..., description="consultation | pharmacy | diagnostics | surgery | room")
    reference_id: uuid.UUID
    amount: Decimal = Field(..., max_digits=10, decimal_places=2)


class ChargeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    encounter_id: Optional[uuid.UUID]
    service_type: str
    reference_id: uuid.UUID
    amount: Decimal
    status: str
    created_at: datetime


# ── Invoices ────────────────────────────────────────────────────
class InvoiceItemCreate(BaseModel):
    description: str
    amount: Decimal = Field(..., max_digits=10, decimal_places=2)
    charge_id: Optional[uuid.UUID] = None


class InvoiceCreate(BaseModel):
    patient_id: uuid.UUID
    items: List[InvoiceItemCreate]
    due_date: Optional[datetime] = None


class InvoiceUpdate(BaseModel):
    status: str = Field(..., description="draft | issued | partial | paid | overdue | cancelled")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"draft", "issued", "partial", "paid", "overdue", "cancelled"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class InvoiceItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    description: str
    amount: Decimal
    charge_id: Optional[uuid.UUID]


class InvoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    total_amount: Decimal
    status: str
    issued_at: Optional[datetime]
    due_date: Optional[datetime]
    created_at: datetime
    items: List[InvoiceItemResponse] = []


# ── Payments ────────────────────────────────────────────────────
class PaymentCreate(BaseModel):
    invoice_id: uuid.UUID
    amount: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)
    payment_method: str = Field(..., description="cash | credit_card | insurance | bank_transfer")


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    invoice_id: uuid.UUID
    amount: Decimal
    payment_method: str
    status: str
    paid_at: Optional[datetime]
    created_at: datetime


# ── Adjustments ─────────────────────────────────────────────────
class AdjustmentCreate(BaseModel):
    invoice_id: uuid.UUID
    adjustment_type: str = Field(..., description="discount | tax | write_off | correction")
    amount: Decimal = Field(..., max_digits=10, decimal_places=2)
    reason: str


class AdjustmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    invoice_id: uuid.UUID
    adjustment_type: str
    amount: Decimal
    reason: str
    created_at: datetime
