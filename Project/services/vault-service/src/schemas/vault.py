"""
MedTrustX Vault Shim Service — Pydantic v2 Schemas
"""
from typing import Dict, Any

from pydantic import BaseModel

# ── Auth ──
class AuthLoginRequest(BaseModel):
    role_id: str
    secret_id: str

class AuthLoginResponse(BaseModel):
    client_token: str
    lease_duration: int
    policies: list[str]

# ── Static Secrets ──
class SecretPutRequest(BaseModel):
    data: Dict[str, Any]

class SecretResponse(BaseModel):
    data: Dict[str, Any]
    version: int

# ── Dynamic Credentials ──
class CredsResponse(BaseModel):
    username: str
    password: str
    ttl: int

# ── Transit ──
class TransitEncryptRequest(BaseModel):
    plaintext: str # base64 encoded

class TransitEncryptResponse(BaseModel):
    ciphertext: str

class TransitDecryptRequest(BaseModel):
    ciphertext: str

class TransitDecryptResponse(BaseModel):
    plaintext: str # base64 encoded
