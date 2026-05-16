"""
MedTrustX Data Governance Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── Assets ──

class DataAssetCreate(BaseModel):
    name: str
    type: str
    owner: str


class DataAssetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    type: str
    owner: str
    created_at: datetime


# ── Classifications ──

class DataClassificationCreate(BaseModel):
    asset_id: uuid.UUID
    classification: str
    sensitivity_level: str


class DataClassificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    asset_id: uuid.UUID
    classification: str
    sensitivity_level: str
    assigned_at: datetime


# ── Lineage ──

class DataLineageCreate(BaseModel):
    source_asset: uuid.UUID
    target_asset: uuid.UUID
    transformation: str = ""


class DataLineageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    source_asset: uuid.UUID
    target_asset: uuid.UUID
    transformation: str
    recorded_at: datetime


# ── Quality Rules ──

class DataQualityRuleCreate(BaseModel):
    asset_id: uuid.UUID
    rule: str


class DataQualityRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    asset_id: uuid.UUID
    rule: str
    status: str
    created_at: datetime


# ── Retention Policies ──

class DataRetentionPolicyCreate(BaseModel):
    asset_id: uuid.UUID
    retention_period: int
    action: str


class DataRetentionPolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    asset_id: uuid.UUID
    retention_period: int
    action: str
    created_at: datetime
