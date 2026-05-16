"""
MedTrustX MPI Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, String, Integer, text
from sqlalchemy.dialects.postgresql import UUID, TEXT
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel

class MasterPatient(BaseModel):
    __tablename__ = "master_patients"
    __table_args__ = (
        Index("ix_master_pat_tenant_global", "tenant_id", "global_identifier"),
    )

    global_identifier: Mapped[str] = mapped_column(String(100), nullable=False)


class PatientLink(BaseModel):
    __tablename__ = "patient_links"
    __table_args__ = (
        Index("ix_pat_link_master", "master_patient_id"),
    )

    master_patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    source_system: Mapped[str] = mapped_column(String(100), nullable=False)
    source_patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    linked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class MatchCandidate(BaseModel):
    __tablename__ = "match_candidates"
    __table_args__ = (
        Index("ix_match_cand_score", "match_score"),
    )

    patient_a: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    patient_b: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    match_score: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default=text("'pending'"))
    evaluated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class MergeHistory(BaseModel):
    __tablename__ = "merge_history"
    __table_args__ = (
        Index("ix_merge_hist_master", "master_patient_id"),
    )

    master_patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    merged_patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    merged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), server_default=text("NOW()"), nullable=False)


class IdentityAttribute(BaseModel):
    __tablename__ = "identity_attributes"
    __table_args__ = (
        Index("ix_id_attr_master", "master_patient_id"),
    )

    master_patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    attribute_key: Mapped[str] = mapped_column(String(100), nullable=False)
    attribute_value: Mapped[str] = mapped_column(TEXT, nullable=False)
