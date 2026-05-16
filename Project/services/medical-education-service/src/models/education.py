"""
MedTrustX Medical Education Service — Domain Entities

Five tables covering the education lifecycle: courses, enrollments,
lessons, assessments, and certifications.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Course(BaseModel):
    """A CME course, training program, or certification track."""
    __tablename__ = "courses"
    __table_args__ = (
        Index("ix_course_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True, default="")
    duration: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # minutes
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="cme")  # cme, simulation, case_study, certification
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")  # draft, published, archived
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class Enrollment(BaseModel):
    """A user enrolled in a course."""
    __tablename__ = "enrollments"
    __table_args__ = (
        Index("ix_enr_course", "tenant_id", "course_id"),
        Index("ix_enr_user", "user_id"),
    )

    course_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="enrolled")  # enrolled, in_progress, completed, dropped
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # percentage 0-100


class Lesson(BaseModel):
    """A single lesson/module within a course."""
    __tablename__ = "lessons"
    __table_args__ = (
        Index("ix_les_course", "tenant_id", "course_id"),
    )

    course_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=True, default="")
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    lesson_type: Mapped[str] = mapped_column(String(50), nullable=False, default="lecture")  # lecture, video, simulation, case_study


class Assessment(BaseModel):
    """An assessment (quiz, exam) attached to a course."""
    __tablename__ = "assessments"
    __table_args__ = (
        Index("ix_ass_course", "tenant_id", "course_id"),
    )

    course_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False, default="Final Assessment")
    passing_score: Mapped[int] = mapped_column(Integer, nullable=False, default=70)
    questions: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class Certification(BaseModel):
    """A certification or CME credit issued upon course completion."""
    __tablename__ = "certifications"
    __table_args__ = (
        Index("ix_cert_user", "tenant_id", "user_id"),
        Index("ix_cert_status", "status"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    course_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")  # active, expired, revoked
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cme_credits: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
