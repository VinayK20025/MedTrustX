"""
Session Models.
"""
from typing import Dict, Any, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SessionCreateRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    user_id: UUID
    device_id: UUID
    mfa_method_used: str

class SessionRefreshRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    session_id: UUID
    refresh_token: str

class SessionResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    session_id: UUID
    access_token: str
    refresh_token: str
    expires_at: datetime
