"""
MedTrustX Configuration Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Configurations ──

class ConfigurationCreate(BaseModel):
    service_name: str
    config_key: str
    config_value: Dict[str, Any]


class ConfigurationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    service_name: str
    config_key: str
    config_value: Dict[str, Any]
    updated_at: datetime


# ── Feature Flags ──

class FeatureFlagCreate(BaseModel):
    flag_name: str
    enabled: bool


class FeatureFlagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    flag_name: str
    enabled: bool
    updated_at: datetime


# ── Environments ──

class EnvironmentCreate(BaseModel):
    name: str
    description: str = ""


class EnvironmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: str
    created_at: datetime


# ── Versions ──

class ConfigVersionCreate(BaseModel):
    version: int
    changes: Dict[str, Any]


class ConfigVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    version: int
    changes: Dict[str, Any]
    created_at: datetime
