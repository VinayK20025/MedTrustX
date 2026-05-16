"""
MedTrustX Automation & RPA Engine Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict

class WorkflowCreate(BaseModel):
    name: str
    definition: Dict[str, Any]

class WorkflowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    definition: Dict[str, Any]
    status: str
    created_at: datetime

class RunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    workflow_id: uuid.UUID
    status: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    workflow_id: uuid.UUID
    task_type: str
    payload: Dict[str, Any]
    status: str
    created_at: datetime
