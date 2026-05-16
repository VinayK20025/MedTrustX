"""
MedTrustX Patient Experience Service — Business Logic Layer

Feedback, surveys, responses, complaints, and scores.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.experience import (
    Complaint,
    ExperienceScore,
    Feedback,
    Survey,
    SurveyResponse,
)
from src.schemas.experience import (
    ComplaintCreate,
    FeedbackCreate,
    SurveyCreate,
    SurveyResponseCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Feedback ──

async def submit_feedback(
    session: AsyncSession, tenant_id: uuid.UUID, data: FeedbackCreate
) -> Feedback:
    feedback = Feedback(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        rating=data.rating,
        comments=data.comments,
    )
    session.add(feedback)
    await session.flush()
    await publish_event("FEEDBACK_SUBMITTED", tenant_id, feedback.id, {"patient_id": str(data.patient_id), "rating": data.rating})
    return feedback


async def get_feedback(
    session: AsyncSession, tenant_id: uuid.UUID, feedback_id: uuid.UUID
) -> Optional[Feedback]:
    result = await session.execute(
        select(Feedback).where(and_(Feedback.id == feedback_id, Feedback.tenant_id == tenant_id, Feedback.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Surveys ──

async def create_survey(
    session: AsyncSession, tenant_id: uuid.UUID, data: SurveyCreate
) -> Survey:
    survey = Survey(
        tenant_id=tenant_id,
        name=data.name,
        questions=data.questions,
    )
    session.add(survey)
    await session.flush()
    return survey


async def get_survey(
    session: AsyncSession, tenant_id: uuid.UUID, survey_id: uuid.UUID
) -> Optional[Survey]:
    result = await session.execute(
        select(Survey).where(and_(Survey.id == survey_id, Survey.tenant_id == tenant_id, Survey.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Survey Responses ──

async def submit_survey_response(
    session: AsyncSession, tenant_id: uuid.UUID, data: SurveyResponseCreate
) -> SurveyResponse:
    response = SurveyResponse(
        tenant_id=tenant_id,
        survey_id=data.survey_id,
        patient_id=data.patient_id,
        responses=data.responses,
    )
    session.add(response)
    await session.flush()
    await publish_event("SURVEY_RESPONSE_SUBMITTED", tenant_id, response.id, {"patient_id": str(data.patient_id), "survey_id": str(data.survey_id)})
    return response


# ── Complaints ──

async def file_complaint(
    session: AsyncSession, tenant_id: uuid.UUID, data: ComplaintCreate
) -> Complaint:
    complaint = Complaint(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        issue_type=data.issue_type,
    )
    session.add(complaint)
    await session.flush()
    await publish_event("COMPLAINT_REPORTED", tenant_id, complaint.id, {"patient_id": str(data.patient_id), "issue_type": data.issue_type})
    return complaint


async def get_complaint(
    session: AsyncSession, tenant_id: uuid.UUID, complaint_id: uuid.UUID
) -> Optional[Complaint]:
    result = await session.execute(
        select(Complaint).where(and_(Complaint.id == complaint_id, Complaint.tenant_id == tenant_id, Complaint.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Experience Scores ──

async def get_experience_scores(
    session: AsyncSession, tenant_id: uuid.UUID, patient_id: uuid.UUID
) -> List[ExperienceScore]:
    result = await session.execute(
        select(ExperienceScore).where(and_(ExperienceScore.patient_id == patient_id, ExperienceScore.tenant_id == tenant_id, ExperienceScore.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
