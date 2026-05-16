"""
MedTrustX Compliance Enforcement Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict

# ── Compliance Rules ──
class ComplianceRuleCreate(BaseModel):
    name: str
    rule_definition: Dict[str, Any]
    active: bool = True

class ComplianceRuleUpdate(BaseModel):
    name: Optional[str] = None
    rule_definition: Optional[Dict[str, Any]] = None
    active: Optional[bool] = None

class ComplianceRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    name: str
    rule_definition: Dict[str, Any]
    active: bool
    created_at: datetime

# ── Compliance Evaluations ──
class ComplianceEvaluationRequest(BaseModel):
    entity_type: str
    entity_id: uuid.UUID
    context_data: Dict[str, Any]

class ComplianceEvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    result: str
    score: int
    evaluated_at: datetime

# ── Compliance Violations ──
class ComplianceViolationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    violation_type: str
    severity: str
    status: str
    detected_at: datetime

# ── Compliance Reports ──
class ComplianceReportCreate(BaseModel):
    report_type: str
    data: Dict[str, Any]

class ComplianceReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    report_type: str
    generated_at: datetime
    data: Dict[str, Any]

# ── Compliance Actions ──
class ComplianceActionCreate(BaseModel):
    violation_id: uuid.UUID
    action_type: str

class ComplianceActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tenant_id: uuid.UUID
    violation_id: uuid.UUID
    action_type: str
    status: str
    executed_at: Optional[datetime]
