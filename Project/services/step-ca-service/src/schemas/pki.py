"""
MedTrustX Step-CA Shim Service — Pydantic v2 Schemas
"""
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SignRequest(BaseModel):
    service_id: str
    csr_pem: str
    ttl: str = "24h"

class SignResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    service_id: str
    cert_pem: str
    expires_at: datetime

class RenewRequest(BaseModel):
    cert_id: str

class RevokeRequest(BaseModel):
    cert_id: str
    reason: str = "unspecified"
