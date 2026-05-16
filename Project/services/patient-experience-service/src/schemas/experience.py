"""
MedTrustX Patient Experience Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


# ── Feedback ──

class FeedbackCreate(BaseModel):
    patient_id: uuid.UUID
    rating: int
    comments: str = ""


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    rating: int
    comments: str
    submitted_at: datetime


# ── Surveys ──

class SurveyCreate(BaseModel):
    name: str
    questions: Dict[str, Any]


class SurveyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    questions: Dict[str, Any]
    created_at: datetime


# ── Survey Responses ──

class SurveyResponseCreate(BaseModel):
    survey_id: uuid.UUID
    patient_id: uuid.UUID
    responses: Dict[str, Any]


class SurveyResponseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    survey_id: uuid.UUID
    patient_id: uuid.UUID
    responses: Dict[str, Any]
    submitted_at: datetime


# ── Complaints ──

class ComplaintCreate(BaseModel):
    patient_id: uuid.UUID
    issue_type: str


class ComplaintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    issue_type: str
    status: str
    reported_at: datetime


# ── Experience Scores ──

class ExperienceScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    score: float
    calculated_at: datetime
