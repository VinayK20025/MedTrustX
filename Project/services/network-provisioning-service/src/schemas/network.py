"""
MedTrustX Network Provisioning Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class NetworkCreate(BaseModel):
    name: str
    cidr: str

class NetworkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    cidr: str
    status: str
    created_at: datetime

class SubnetCreate(BaseModel):
    network_id: uuid.UUID
    cidr: str

class SubnetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    network_id: uuid.UUID
    cidr: str
    status: str
    created_at: datetime

class IPAllocate(BaseModel):
    subnet_id: uuid.UUID
    ip_address: str
    assigned_to: str

class IPResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    subnet_id: uuid.UUID
    ip_address: str
    assigned_to: str
    status: str
    created_at: datetime

class DeviceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    device_id: uuid.UUID
    config: Dict[str, Any]
    status: str
    created_at: datetime
