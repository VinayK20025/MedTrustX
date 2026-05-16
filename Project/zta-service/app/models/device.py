"""
Device models.
"""
from typing import Dict, Any, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class DeviceRegistrationRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    mac_address: str
    device_name: str
    os: str
    os_version: str
    patch_level: str
    owner_user_id: UUID
    tenant_id: UUID

class DeviceRegistrationResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    device_id: UUID
    trust_score: float

class DeviceAttestationRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    device_id: UUID
    mac_address: str
    compliance_evidence: Dict[str, Any]

class AttestationResult(BaseModel):
    model_config = ConfigDict(strict=True)
    trust_score: float
    status: str
