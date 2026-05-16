"""
Patient Identifier Models.
"""
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID

class IdentifierCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    system: str
    value: str
    type_code: str

class IdentifierResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    id: UUID
    patient_id: UUID
    system: str
    value: str
    type_code: str
    created_at: datetime
