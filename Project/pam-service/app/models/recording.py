"""
Recording Models.
"""
from typing import Dict, Any, Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class EventLogRequest(BaseModel):
    model_config = ConfigDict(strict=True)
    event_type: str
    action: str
    target: str
    metadata: Optional[Dict[str, Any]] = None

class RecordingResponse(BaseModel):
    model_config = ConfigDict(strict=True)
    session_id: UUID
    user_id: UUID
    jit_request_id: UUID
    events: List[Dict[str, Any]]
    created_at: datetime
