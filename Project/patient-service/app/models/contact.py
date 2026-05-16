"""
Patient Contact Models.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class ContactCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    relationship: str
    first_name: str
    last_name: str
    phone: str
    email: Optional[str] = None
    address: Optional[Dict[str, Any]] = None

class ContactResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    id: UUID
    patient_id: UUID
    relationship: str
    first_name: str
    last_name: str
    phone: str
    email: Optional[str]
    address: Optional[Dict[str, Any]]
    created_at: datetime
