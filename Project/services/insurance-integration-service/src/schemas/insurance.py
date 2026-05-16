"""
MedTrustX Insurance Integration Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Eligibility ──

class EligibilityCheckCreate(BaseModel):
    policy_id: uuid.UUID


class EligibilityCheckResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    policy_id: uuid.UUID
    status: str
    response: Dict[str, Any]
    checked_at: datetime


# ── Preauth ──

class PreauthorizationCreate(BaseModel):
    encounter_id: uuid.UUID
    request_payload: Dict[str, Any]


class PreauthorizationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    encounter_id: uuid.UUID
    request_payload: Dict[str, Any]
    status: str
    reference_no: Optional[str]
    created_at: datetime


# ── Claims ──

class ClaimCreate(BaseModel):
    encounter_id: uuid.UUID
    insurer_id: uuid.UUID
    claim_amount: float


class ClaimResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    encounter_id: uuid.UUID
    insurer_id: uuid.UUID
    claim_amount: float
    status: str
    submitted_at: Optional[datetime]


class ClaimStatusUpdateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    claim_id: uuid.UUID
    payer_status: str
    internal_status: str
    payload: Dict[str, Any]


# ── Remittances ──

class RemittanceCreate(BaseModel):
    claim_id: uuid.UUID
    paid_amount: float
    adjustments: Dict[str, Any]


class RemittanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    claim_id: uuid.UUID
    paid_amount: float
    adjustments: Dict[str, Any]
    received_at: datetime
