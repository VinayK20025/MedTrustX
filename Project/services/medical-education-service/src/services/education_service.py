"""
MedTrustX Medical Education Service — Business Logic Layer

Course management, enrollment, lesson retrieval, assessment scoring,
and automatic certification issuance upon passing.
"""
import uuid
import random
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional

from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.education import (
    Assessment,
    Certification,
    Course,
    Enrollment,
    Lesson,
)
from src.schemas.education import CourseCreateRequest, EnrollRequest
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Courses ──

async def create_course(
    session: AsyncSession, tenant_id: uuid.UUID, data: CourseCreateRequest
) -> Course:
    course = Course(
        tenant_id=tenant_id,
        name=data.name,
        description=data.description,
        duration=data.duration,
        category=data.category,
        status="draft",
    )
    session.add(course)
    await session.flush()
    await publish_event("COURSE_CREATED", tenant_id, course.id, {"name": data.name})
    return course


async def get_course(
    session: AsyncSession, tenant_id: uuid.UUID, course_id: uuid.UUID
) -> Optional[Course]:
    result = await session.execute(
        select(Course).where(
            and_(Course.id == course_id, Course.tenant_id == tenant_id, Course.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def list_courses(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[Course]:
    result = await session.execute(
        select(Course).where(and_(Course.tenant_id == tenant_id, Course.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Enrollments ──

async def enroll_user(
    session: AsyncSession, tenant_id: uuid.UUID, course_id: uuid.UUID, data: EnrollRequest
) -> Enrollment:
    enrollment = Enrollment(
        tenant_id=tenant_id,
        course_id=course_id,
        user_id=data.user_id,
        status="enrolled",
    )
    session.add(enrollment)
    await session.flush()
    await publish_event(
        "COURSE_ENROLLED", tenant_id, course_id,
        {"user_id": str(data.user_id)},
    )
    return enrollment


# ── Lessons ──

async def get_course_lessons(
    session: AsyncSession, tenant_id: uuid.UUID, course_id: uuid.UUID
) -> List[Lesson]:
    result = await session.execute(
        select(Lesson).where(
            and_(Lesson.tenant_id == tenant_id, Lesson.course_id == course_id, Lesson.deleted_at.is_(None))
        ).order_by(Lesson.order)
    )
    return list(result.scalars().all())


# ── Assessments ──

async def submit_assessment(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    assessment_id: uuid.UUID,
    user_id: uuid.UUID,
    answers: Dict[str, Any],
) -> Dict[str, Any]:
    """Score an assessment submission and auto-issue certification if passed."""
    result = await session.execute(
        select(Assessment).where(
            and_(Assessment.id == assessment_id, Assessment.tenant_id == tenant_id, Assessment.deleted_at.is_(None))
        )
    )
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise ValueError("Assessment not found")

    # Simulate scoring — in production this would evaluate against stored answers
    score = random.randint(50, 100)
    passed = score >= assessment.passing_score
    certification_issued = False

    if passed:
        cert = Certification(
            tenant_id=tenant_id,
            user_id=user_id,
            course_id=assessment.course_id,
            status="active",
            expires_at=datetime.now(timezone.utc) + timedelta(days=365),
            cme_credits=max(1, random.randint(1, 10)),
        )
        session.add(cert)
        await session.flush()
        certification_issued = True

        await publish_event(
            "CERTIFICATION_ISSUED", tenant_id, cert.id,
            {"user_id": str(user_id), "course_id": str(assessment.course_id), "cme_credits": cert.cme_credits},
        )

    return {
        "assessment_id": assessment_id,
        "user_id": user_id,
        "score": score,
        "passed": passed,
        "certification_issued": certification_issued,
    }


# ── Certifications ──

async def get_user_certifications(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID
) -> List[Certification]:
    result = await session.execute(
        select(Certification).where(
            and_(Certification.tenant_id == tenant_id, Certification.user_id == user_id, Certification.deleted_at.is_(None))
        ).order_by(desc(Certification.issued_at))
    )
    return list(result.scalars().all())
