"""
MedTrustX CDSS Service — Domain Entities

Tables:
  cdss_rules           – Clinical logic and heuristics definitions
  cdss_alerts          – Fired warnings resulting from evaluated rules
  cdss_recommendations – Generated treatment pathways or suggestions
  cdss_evaluations     – Audit trail of rule inference executions
"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class CDSSRule(BaseModel):
    """
    Definitions for clinical logic.
    E.g., "If HR > 100 AND Temp > 38.0 -> Trigger Sepsis Alert"
    """

    __tablename__ = "cdss_rules"
    __table_args__ = (
        Index("ix_rules_tenant_active", "tenant_id", "active"),
        {"comment": "Clinical rule definitions"},
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    
    description: Mapped[str] = mapped_column(
        Text,
        nullable=True,
    )

    rule_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="heuristic | ml_model | interaction_check",
    )
    
    definition: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        comment="JSON representing AST or thresholds for the rule engine",
    )
    
    active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=text("true"),
    )


class CDSSAlert(BaseModel):
    """
    Generated warnings for abnormal patient conditions.
    """

    __tablename__ = "cdss_alerts"
    __table_args__ = (
        Index("ix_alerts_patient", "tenant_id", "patient_id"),
        Index("ix_alerts_severity_status", "tenant_id", "severity", "status"),
        Index("ix_alerts_triggered_at", "triggered_at"),
        {"comment": "Triggered clinical warnings"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    
    encounter_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )

    alert_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="E.g., Sepsis Risk, Drug Interaction",
    )
    
    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="info | warning | critical",
    )
    
    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default=text("'active'"),
        comment="active | acknowledged | resolved",
    )

    triggered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
    
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )


class CDSSRecommendation(BaseModel):
    """
    Positive pathways or suggested interventions.
    """

    __tablename__ = "cdss_recommendations"
    __table_args__ = (
        Index("ix_recommendations_patient", "tenant_id", "patient_id"),
        {"comment": "Clinical intervention suggestions"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    recommendation: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    
    source: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="E.g., guideline_xyz, local_protocol, ml_model_v2",
    )
    
    confidence_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="0.0 to 1.0 confidence representation",
    )


class CDSSEvaluation(BaseModel):
    """
    Audit log of data evaluated by the engine.
    Crucial for regulatory compliance and AI bias auditing.
    """

    __tablename__ = "cdss_evaluations"
    __table_args__ = (
        Index("ix_evaluations_patient", "tenant_id", "patient_id"),
        {"comment": "Audit trail for inference operations"},
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )

    input_data: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        comment="Snapshot of clinical context used during inference",
    )
    
    result: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        comment="The outcome of the evaluation (e.g., triggered alerts)",
    )
    
    evaluated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )
