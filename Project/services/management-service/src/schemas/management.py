"""
MedTrustX Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict

# ── System Configs ──
class SystemConfigCreate(BaseModel):
    config_key: str
    config_value: Dict[str, Any]

class SystemConfigUpdate(BaseModel):
    config_value: Dict[str, Any]

class SystemConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: Optional[uuid.UUID]
    config_key: str
    config_value: Dict[str, Any]
    updated_at: datetime

# ── Feature Flags ──
class FeatureFlagCreate(BaseModel):
    flag_name: str
    enabled: bool = False
    conditions: Optional[Dict[str, Any]] = None

class FeatureFlagUpdate(BaseModel):
    enabled: Optional[bool] = None
    conditions: Optional[Dict[str, Any]] = None

class FeatureFlagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: Optional[uuid.UUID]
    flag_name: str
    enabled: bool
    conditions: Optional[Dict[str, Any]]
    updated_at: datetime

# ── Tenant Settings ──
class TenantSettingCreate(BaseModel):
    setting_key: str
    setting_value: Dict[str, Any]

class TenantSettingUpdate(BaseModel):
    setting_value: Dict[str, Any]

class TenantSettingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    setting_key: str
    setting_value: Dict[str, Any]
    updated_at: datetime

# ── Service Configs ──
class ServiceConfigCreate(BaseModel):
    service_name: str
    config: Dict[str, Any]

class ServiceConfigUpdate(BaseModel):
    config: Dict[str, Any]

class ServiceConfigResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: Optional[uuid.UUID]
    service_name: str
    config: Dict[str, Any]
    updated_at: datetime

# ── Config Audit Logs ──
class ConfigAuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: Optional[uuid.UUID]
    config_key: str
    action: str
    performed_by: uuid.UUID
    timestamp: datetime
