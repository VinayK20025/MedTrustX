"""
Audit Event Model.
"""
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class AuditEventCreate(BaseModel):
    model_config = ConfigDict(strict=True)
    id: str
    tenant_id: str
    user_id: str
    action: str
    resource_type: str
    resource_id: str
    details: Dict[str, Any]
    ip_address: str

class AuditEventRecord(BaseModel):
    model_config = ConfigDict(strict=True)
    id: UUID
    tenant_id: UUID
    user_id: UUID
    action: str
    resource_type: str
    resource_id: str
    details: Dict[str, Any]
    ip_address: str
    created_at: datetime
    previous_hash: str
    current_hash: str
    chain_sequence: int
