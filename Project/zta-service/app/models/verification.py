"""
Verification models.
"""
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class ContinuousVerifyRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    session_id: UUID
    user_id: UUID
    device_id: UUID
    tenant_id: UUID
    source_ip: str

class VerificationResult(BaseModel):
    model_config = ConfigDict(strict=True)
    next_check_in_seconds: int
    action: str
    trust_score: float
