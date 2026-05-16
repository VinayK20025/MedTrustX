"""
MedTrustX Ethics Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Cases ──

class EthicsCaseCreate(BaseModel):
    case_type: str
    description: str
    submitter_id: uuid.UUID


class EthicsCaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_type: str
    description: str
    status: str
    submitted_at: datetime
    submitter_id: uuid.UUID


# ── Reviews ──

class EthicsReviewCreate(BaseModel):
    reviewer_id: uuid.UUID
    decision: str
    comments: str = ""


class EthicsReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    case_id: uuid.UUID
    reviewer_id: uuid.UUID
    decision: str
    comments: Optional[str]
    reviewed_at: datetime


# ── Committee ──

class CommitteeMemberCreate(BaseModel):
    user_id: uuid.UUID
    role: str


class CommitteeMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    role: str
    appointed_at: datetime


# ── Conflicts ──

class ConflictDeclarationCreate(BaseModel):
    user_id: uuid.UUID
    case_id: Optional[uuid.UUID] = None
    declaration: str


class ConflictDeclarationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    case_id: Optional[uuid.UUID]
    declaration: str
    declared_at: datetime


# ── Policies ──

class EthicsPolicyCreate(BaseModel):
    policy_name: str
    rules: Dict[str, Any] = {}


class EthicsPolicyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    policy_name: str
    rules: Dict[str, Any]
    created_at: datetime
