"""
MedTrustX Notification Orchestrator Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict

# ── Workflows ──
class WorkflowCreate(BaseModel):
    name: str
    definition: Dict[str, Any]
    active: bool = True

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    definition: Optional[Dict[str, Any]] = None
    active: Optional[bool] = None

class WorkflowResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    definition: Dict[str, Any]
    active: bool
    created_at: datetime

# ── Escalation Rules ──
class EscalationRuleCreate(BaseModel):
    trigger_event: str
    escalation_chain: Dict[str, Any]

class EscalationRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    trigger_event: str
    escalation_chain: Dict[str, Any]
    created_at: datetime

# ── Workflow Events ──
class WorkflowEventCreate(BaseModel):
    instance_id: uuid.UUID
    event_type: str
    payload: Optional[Dict[str, Any]] = None

class WorkflowEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    instance_id: uuid.UUID
    tenant_id: uuid.UUID
    event_type: str
    payload: Optional[Dict[str, Any]]
    created_at: datetime

# ── Workflow Steps ──
class WorkflowStepResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    instance_id: uuid.UUID
    tenant_id: uuid.UUID
    step_type: str
    channel: Optional[str]
    status: str
    executed_at: Optional[datetime]

# ── Workflow Instances ──
class InstanceCreate(BaseModel):
    workflow_id: uuid.UUID
    reference_id: uuid.UUID

class InstanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    workflow_id: uuid.UUID
    tenant_id: uuid.UUID
    reference_id: uuid.UUID
    status: str
    started_at: datetime
    completed_at: Optional[datetime]

class InstanceDetail(InstanceResponse):
    steps: List[WorkflowStepResponse] = []
    events: List[WorkflowEventResponse] = []
