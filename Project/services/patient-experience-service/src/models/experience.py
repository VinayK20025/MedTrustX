"""
MedTrustX Patient Experience Service — Domain Entities

Five tables orchestrating feedback, surveys, responses, complaints, and scores.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class Feedback(BaseModel):
    """Direct, unprompted feedback from a patient."""
    __tablename__ = "feedback"
    __table_args__ = (
        Index("ix_px_feed_pat", "tenant_id", "patient_id"),
        Index("ix_px_feed_rating", "tenant_id", "rating"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comments: Mapped[str] = mapped_column(Text, nullable=False, default="")
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class Survey(BaseModel):
    """A configured survey template (e.g., Post-Discharge CSAT)."""
    __tablename__ = "surveys"
    __table_args__ = (
        Index("ix_px_surv_name", "tenant_id", "name"),
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    questions: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class SurveyResponse(BaseModel):
    """A patient's answers to a specific Survey."""
    __tablename__ = "survey_responses"
    __table_args__ = (
        Index("ix_px_res_surv", "tenant_id", "survey_id"),
        Index("ix_px_res_pat", "tenant_id", "patient_id"),
    )

    survey_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    responses: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class Complaint(BaseModel):
    """A formal grievance requiring resolution."""
    __tablename__ = "complaints"
    __table_args__ = (
        Index("ix_px_comp_pat", "tenant_id", "patient_id"),
        Index("ix_px_comp_status", "tenant_id", "status"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    issue_type: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")  # open, investigating, resolved
    reported_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )


class ExperienceScore(BaseModel):
    """Aggregated, calculated experience score (e.g., NPS) for a patient."""
    __tablename__ = "experience_scores"
    __table_args__ = (
        Index("ix_px_score_pat", "tenant_id", "patient_id"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    calculated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
        server_default=text("NOW()"), nullable=False,
    )
