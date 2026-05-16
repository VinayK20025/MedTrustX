"""
Hash Chain Model and Reporting.
"""
from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class IntegrityReport(BaseModel):
    model_config = ConfigDict(strict=True)
    tenant_id: str
    verified_count: int
    tampered_count: int
    first_tampered_sequence: Optional[int]
    chain_intact: bool
    verification_timestamp: datetime
