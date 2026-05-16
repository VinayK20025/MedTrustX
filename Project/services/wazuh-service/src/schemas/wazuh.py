"""
MedTrustX Wazuh Shim Service — Pydantic v2 Schemas
"""
from typing import Dict, Any, Optional
import uuid
from pydantic import BaseModel, ConfigDict

class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    rule_id: str
    severity: str
    description: str
    event_data: Dict[str, Any]

class RuleCreateRequest(BaseModel):
    rule_id: str
    description: str
    level: int
    match_conditions: Dict[str, Any]

class RuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    rule_id: str
    description: str
    level: int
    match_conditions: Dict[str, Any]

class LogIngestRequest(BaseModel):
    service_name: str
    event_type: str
    log_data: Dict[str, Any]
