"""
MedTrustX Legal Risk Analytics Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class RiskScore(BaseModel):
    """Calculated compliance/liability risk for a specific legal case."""
    __tablename__ = "risk_scores"
    __table_args__ = (
        Index("ix_risk_tenant_case", "tenant_id", "case_id"),
        Index("ix_risk_level", "risk_level"),
    )
    case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    risk_level: Mapped[str] = mapped_column(String(50), nullable=False) # critical, high, medium, low
    score: Mapped[float] = mapped_column(Float, nullable=False)

class RiskFactor(BaseModel):
    """Specific factors that contributed to a case's risk score."""
    __tablename__ = "risk_factors"
    __table_args__ = (
        Index("ix_factor_tenant_case", "tenant_id", "case_id"),
    )
    case_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    factor_name: Mapped[str] = mapped_column(String(255), nullable=False) # e.g. "missing_evidence", "late_filing"
    impact: Mapped[float] = mapped_column(Float, nullable=False) # Contribution weight

class TrendAnalysis(BaseModel):
    """Aggregated historical trends for legal and compliance domains."""
    __tablename__ = "trend_analysis"
    __table_args__ = (
        Index("ix_trend_tenant_cat", "tenant_id", "category"),
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. "malpractice_claims", "data_breaches"
    metrics: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class PredictiveModel(BaseModel):
    """Metadata regarding AI models currently deployed for outcome prediction."""
    __tablename__ = "predictive_models"
    model_name: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, nullable=False)
