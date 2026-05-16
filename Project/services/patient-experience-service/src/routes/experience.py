"""
MedTrustX Patient Experience Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.experience import (
    ComplaintCreate, ComplaintResponse,
    ExperienceScoreResponse,
    FeedbackCreate, FeedbackResponse,
    SurveyCreate, SurveyResponse,
    SurveyResponseCreate, SurveyResponseResponse
)
from src.services import experience_service

router = APIRouter(tags=["Patient Experience Service"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Feedback ──

@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(data: FeedbackCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    feedback = await experience_service.submit_feedback(session, tid, data)
    await session.commit()
    return feedback

@router.get("/feedback/{feedback_id}", response_model=FeedbackResponse)
async def get_feedback(feedback_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    feedback = await experience_service.get_feedback(session, tid, feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback


# ── Surveys ──

@router.post("/surveys", response_model=SurveyResponse, status_code=status.HTTP_201_CREATED)
async def create_survey(data: SurveyCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    survey = await experience_service.create_survey(session, tid, data)
    await session.commit()
    return survey

@router.get("/surveys/{survey_id}", response_model=SurveyResponse)
async def get_survey(survey_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    survey = await experience_service.get_survey(session, tid, survey_id)
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    return survey


# ── Survey Responses ──

@router.post("/survey-responses", response_model=SurveyResponseResponse, status_code=status.HTTP_201_CREATED)
async def submit_survey_response(data: SurveyResponseCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    response = await experience_service.submit_survey_response(session, tid, data)
    await session.commit()
    return response


# ── Complaints ──

@router.post("/complaints", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def file_complaint(data: ComplaintCreate, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    complaint = await experience_service.file_complaint(session, tid, data)
    await session.commit()
    return complaint

@router.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(complaint_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    complaint = await experience_service.get_complaint(session, tid, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


# ── Experience Scores ──

@router.get("/experience-scores/{patient_id}", response_model=List[ExperienceScoreResponse])
async def get_experience_scores(patient_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await experience_service.get_experience_scores(session, tid, patient_id)
