"""
MedTrustX Medical Education Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

from pydantic import BaseModel, ConfigDict


# ── Courses ──

class CourseCreateRequest(BaseModel):
    name: str
    description: str = ""
    duration: int = 0
    category: str = "cme"


class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    description: Optional[str]
    duration: int
    category: str
    status: str


# ── Enrollments ──

class EnrollRequest(BaseModel):
    user_id: uuid.UUID


class EnrollmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    course_id: uuid.UUID
    user_id: uuid.UUID
    status: str
    enrolled_at: datetime
    progress: int


# ── Lessons ──

class LessonResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    content: Optional[str]
    order: int
    lesson_type: str


# ── Assessments ──

class AssessmentSubmitRequest(BaseModel):
    user_id: uuid.UUID
    answers: Dict[str, Any] = {}


class AssessmentResultResponse(BaseModel):
    assessment_id: uuid.UUID
    user_id: uuid.UUID
    score: int
    passed: bool
    certification_issued: bool


# ── Certifications ──

class CertificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    course_id: uuid.UUID
    status: str
    issued_at: datetime
    expires_at: Optional[datetime]
    cme_credits: int
