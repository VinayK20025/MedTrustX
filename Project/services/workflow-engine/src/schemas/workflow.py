"""
MedTrustX Workflow Engine — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Workflows ──

class WorkflowCreate(BaseModel):
    name: str


class WorkflowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    status: str
    created_at: datetime


# ── Definitions ──

class WorkflowDefinitionCreate(BaseModel):
    workflow_id: uuid.UUID
    definition: Dict[str, Any]
    version: int = 1


class WorkflowDefinitionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    workflow_id: uuid.UUID
    definition: Dict[str, Any]
    version: int
    created_at: datetime


# ── Instances ──

class WorkflowInstanceCreate(BaseModel):
    workflow_id: uuid.UUID
    initial_state: str = "started"


class WorkflowInstanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    workflow_id: uuid.UUID
    state: str
    started_at: datetime
    completed_at: Optional[datetime]


# ── Tasks ──

class TaskCreate(BaseModel):
    instance_id: uuid.UUID
    task_type: str
    assigned_to: Optional[uuid.UUID] = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    instance_id: uuid.UUID
    task_type: str
    status: str
    assigned_to: Optional[uuid.UUID]
    created_at: datetime


# ── Transitions ──

class TransitionCreate(BaseModel):
    instance_id: uuid.UUID
    to_state: str


class TransitionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    instance_id: uuid.UUID
    from_state: str
    to_state: str
    triggered_at: datetime
