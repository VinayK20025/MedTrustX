"""
MedTrustX Kong Gateway Shim Service — Pydantic v2 Schemas
"""
import uuid
from typing import Dict, Any, Optional

from pydantic import BaseModel, ConfigDict


# ── Services ──

class ServiceCreateRequest(BaseModel):
    name: str
    url: str
    protocol: str = "http"
    enabled: bool = True


class ServiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    url: str
    protocol: str
    enabled: bool


# ── Routes ──

class RouteCreateRequest(BaseModel):
    service_id: uuid.UUID
    path: str
    methods: str = "GET,POST"
    strip_path: bool = True


class RouteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    service_id: uuid.UUID
    path: str
    methods: str
    strip_path: bool


# ── Consumers ──

class ConsumerCreateRequest(BaseModel):
    username: str
    custom_id: Optional[str] = None


class ConsumerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    username: str
    custom_id: Optional[str]


# ── Plugins ──

class PluginCreateRequest(BaseModel):
    service_id: Optional[uuid.UUID] = None
    route_id: Optional[uuid.UUID] = None
    name: str
    config: Dict[str, Any] = {}
    enabled: bool = True


class PluginResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    service_id: Optional[uuid.UUID]
    route_id: Optional[uuid.UUID]
    name: str
    config: Dict[str, Any]
    enabled: bool
