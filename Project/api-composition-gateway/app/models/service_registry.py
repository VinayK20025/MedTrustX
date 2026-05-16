"""
Service Registry Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional

class ServiceRegistration(BaseModel):
    model_config = ConfigDict(strict=True)
    service_name: str
    url: str
    health_endpoint: str

class ServiceInstance(BaseModel):
    model_config = ConfigDict(strict=True)
    service_name: str
    url: str
    health: str = "healthy"
    weight: float = 1.0
    circuit_state: str = "CLOSED"
    avg_response_ms: float = 0.0
