"""
MedTrustX SCM Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Vendors ─────────────────────────────────────────────────────
class VendorCreate(BaseModel):
    name: str = Field(..., max_length=100)
    contact_info: str


class VendorUpdate(BaseModel):
    status: str = Field(..., description="active | suspended | blacklisted")


class VendorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    contact_info: str
    status: str
    created_at: datetime


# ── Purchase Order Items ────────────────────────────────────────
class PurchaseOrderItemCreate(BaseModel):
    item_id: uuid.UUID
    quantity: int = Field(..., gt=0)
    unit_price: Decimal = Field(..., max_digits=10, decimal_places=2, gt=0)


class PurchaseOrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    item_id: uuid.UUID
    quantity: int
    unit_price: Decimal


# ── Purchase Orders ─────────────────────────────────────────────
class PurchaseOrderCreate(BaseModel):
    vendor_id: uuid.UUID
    items: List[PurchaseOrderItemCreate]


class PurchaseOrderUpdate(BaseModel):
    status: str = Field(..., description="draft | pending_approval | approved | dispatched | fulfilled | cancelled")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"draft", "pending_approval", "approved", "dispatched", "fulfilled", "cancelled"}
        if v.lower() not in allowed:
            raise ValueError(f"status must be one of {allowed}")
        return v.lower()


class PurchaseOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    vendor_id: uuid.UUID
    total_amount: Decimal
    status: str
    created_at: datetime
    approved_at: Optional[datetime]
    items: List[PurchaseOrderItemResponse] = []


# ── Goods Receipts ──────────────────────────────────────────────
class GoodsReceiptCreate(BaseModel):
    purchase_order_id: uuid.UUID
    received_by: uuid.UUID


class GoodsReceiptUpdate(BaseModel):
    status: str = Field(..., description="pending_qa | accepted | rejected")


class GoodsReceiptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    purchase_order_id: uuid.UUID
    received_by: uuid.UUID
    received_at: datetime
    status: str


# ── Shipments ───────────────────────────────────────────────────
class ShipmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    purchase_order_id: uuid.UUID
    tracking_number: str
    status: str
    estimated_delivery: Optional[datetime]
