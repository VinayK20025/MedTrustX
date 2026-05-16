"""
MedTrustX SonarQube Quality Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ── Projects ──

class ProjectCreate(BaseModel):
    repo_id: uuid.UUID
    name: str


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    repo_id: uuid.UUID
    name: str
    created_at: datetime


# ── Analyses ──

class AnalysisCreate(BaseModel):
    project_id: uuid.UUID


class AnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    project_id: uuid.UUID
    status: str
    score: float
    created_at: datetime


# ── Issues ──

class CodeIssueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    project_id: uuid.UUID
    severity: str
    type: str
    description: str
    created_at: datetime


# ── Quality Gates ──

class QualityGateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    project_id: uuid.UUID
    status: str
    evaluated_at: datetime
