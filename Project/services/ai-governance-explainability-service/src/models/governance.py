"""
MedTrustX AI Governance & Explainability Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class ModelEntity(BaseModel):
    """Registered AI/ML models under governance."""
    __tablename__ = "models"
    __table_args__ = (
        Index("ix_model_tenant_status", "tenant_id", "status"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

class ModelDecision(BaseModel):
    """Audit log of AI inferences and their outcomes."""
    __tablename__ = "model_decisions"
    __table_args__ = (
        Index("ix_decision_tenant_model", "tenant_id", "model_id"),
        Index("ix_decision_created_at", "created_at"),
    )
    model_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    input: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    output: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
    decision: Mapped[str] = mapped_column(String(255), nullable=False)

class ExplainabilityReport(BaseModel):
    """SHAP/LIME or similar explainability artifacts for decisions."""
    __tablename__ = "explainability_reports"
    __table_args__ = (
        Index("ix_explain_tenant_model", "tenant_id", "model_id"),
    )
    model_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    explanation: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})

class BiasMetric(BaseModel):
    """Fairness and bias tracking metrics over time."""
    __tablename__ = "bias_metrics"
    __table_args__ = (
        Index("ix_bias_tenant_model", "tenant_id", "model_id"),
    )
    model_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)

class GovernancePolicy(BaseModel):
    """Rules ensuring AI compliance and ethical guardrails."""
    __tablename__ = "governance_policies"
    policy_name: Mapped[str] = mapped_column(String(255), nullable=False)
    rules: Mapped[dict] = mapped_column(JSONB, nullable=False, default={})
