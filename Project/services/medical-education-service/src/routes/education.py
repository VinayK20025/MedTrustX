"""
MedTrustX Medical Education Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.education import (
    AssessmentSubmitRequest,
    AssessmentResultResponse,
    CertificationResponse,
    CourseCreateRequest,
    CourseResponse,
    EnrollRequest,
    EnrollmentResponse,
    LessonResponse,
)
from src.services import education_service

router = APIRouter(tags=["Medical Education"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ── Courses ──

@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED, summary="Create course")
async def create_course(data: CourseCreateRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    course = await education_service.create_course(session, tid, data)
    await session.commit()
    return course


@router.get("/courses", response_model=List[CourseResponse], summary="List courses")
async def list_courses(request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await education_service.list_courses(session, tid)


@router.get("/courses/{course_id}", response_model=CourseResponse, summary="Get course")
async def get_course(course_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    course = await education_service.get_course(session, tid, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


# ── Enrollments ──

@router.post("/courses/{course_id}/enroll", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED, summary="Enroll in course")
async def enroll(course_id: uuid.UUID, data: EnrollRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    enrollment = await education_service.enroll_user(session, tid, course_id, data)
    await session.commit()
    return enrollment


# ── Lessons ──

@router.get("/courses/{course_id}/lessons", response_model=List[LessonResponse], summary="Get course lessons")
async def get_lessons(course_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await education_service.get_course_lessons(session, tid, course_id)


# ── Assessments ──

@router.post("/assessments/{assessment_id}/submit", response_model=AssessmentResultResponse, summary="Submit assessment")
async def submit_assessment(assessment_id: uuid.UUID, data: AssessmentSubmitRequest, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    try:
        result = await education_service.submit_assessment(session, tid, assessment_id, data.user_id, data.answers)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    await session.commit()
    return result


# ── Certifications ──

@router.get("/certifications/{user_id}", response_model=List[CertificationResponse], summary="Get user certifications")
async def get_certifications(user_id: uuid.UUID, request: Request, session: AsyncSession = Depends(get_session)):
    tid = _get_tenant_id(request)
    return await education_service.get_user_certifications(session, tid, user_id)
