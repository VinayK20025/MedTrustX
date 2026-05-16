"""
MedTrustX Vendor Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Vendors ──

class VendorCreate(BaseModel):
    name: str
    vendor_type: str


class VendorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    vendor_type: str
    status: str
    onboarded_at: datetime


# ── Contracts ──

class VendorContractCreate(BaseModel):
    vendor_id: uuid.UUID
    contract_details: Dict[str, Any]
    start_date: datetime
    end_date: datetime


class VendorContractResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    vendor_id: uuid.UUID
    contract_details: Dict[str, Any]
    start_date: datetime
    end_date: datetime


# ── SLAs ──

class SLACreate(BaseModel):
    vendor_id: uuid.UUID
    metric: str
    target_value: float


class SLAResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    vendor_id: uuid.UUID
    metric: str
    target_value: float
    created_at: datetime


# ── Performance ──

class VendorPerformanceCreate(BaseModel):
    vendor_id: uuid.UUID
    kpi: str
    value: float


class VendorPerformanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    vendor_id: uuid.UUID
    kpi: str
    value: float
    recorded_at: datetime


# ── Risks ──

class VendorRiskCreate(BaseModel):
    vendor_id: uuid.UUID
    risk_type: str
    score: int


class VendorRiskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    vendor_id: uuid.UUID
    risk_type: str
    score: int
    created_at: datetime
