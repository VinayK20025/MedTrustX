"""
MedTrustX OPA Shim Service — Pydantic v2 Schemas
"""
import uuid
from typing import Optional, Dict, Any

from pydantic import BaseModel, ConfigDict

# ── Data & Policies ──
class DataPutRequest(BaseModel):
    data: Dict[str, Any]

class PolicyPutRequest(BaseModel):
    rego: str

class PolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    package_name: str
    rego_code: str

# ── Evaluation ──
class EvalRequest(BaseModel):
    input: Dict[str, Any]

class EvalResponse(BaseModel):
    result: Any
