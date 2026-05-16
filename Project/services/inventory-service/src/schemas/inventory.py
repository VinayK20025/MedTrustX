"""
MedTrustX Inventory Service — Pydantic Schemas
"""
import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ── Inventory Items ─────────────────────────────────────────────
class InventoryItemCreate(BaseModel):
    name: str = Field(..., max_length=100)
    category: str = Field(..., description="drug | consumable | surgical | equipment | general")
    unit: str = Field(..., description="mg | ml | piece | box")


class InventoryItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    category: str
    unit: str
    created_at: datetime


# ── Stock Levels ────────────────────────────────────────────────
class StockLevelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    item_id: uuid.UUID
    available_quantity: int
    updated_at: datetime


# ── Stock Batches ───────────────────────────────────────────────
class StockBatchCreate(BaseModel):
    item_id: uuid.UUID
    batch_number: str = Field(..., max_length=50)
    quantity: int = Field(..., gt=0)
    expiry_date: Optional[datetime] = None


class StockBatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    item_id: uuid.UUID
    batch_number: str
    quantity: int
    expiry_date: Optional[datetime]
    created_at: datetime


# ── Stock Movements ─────────────────────────────────────────────
class StockMovementCreate(BaseModel):
    item_id: uuid.UUID
    movement_type: str = Field(..., description="inbound | outbound | adjustment | write_off")
    quantity: int = Field(..., description="Positive for inbound, negative for outbound/write_off")
    reference_id: Optional[uuid.UUID] = None


class StockMovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    item_id: uuid.UUID
    movement_type: str
    quantity: int
    reference_id: Optional[uuid.UUID]
    created_at: datetime


# ── Stock Reservations ──────────────────────────────────────────
class StockReservationCreate(BaseModel):
    item_id: uuid.UUID
    reserved_quantity: int = Field(..., gt=0)
    reference_type: str = Field(..., description="surgery | patient_admission | external_transfer")
    reference_id: uuid.UUID


class StockReservationUpdate(BaseModel):
    status: str = Field(..., description="active | fulfilled | released")


class StockReservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    item_id: uuid.UUID
    reserved_quantity: int
    reference_type: str
    reference_id: uuid.UUID
    status: str
    created_at: datetime
