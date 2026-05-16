"""
MedTrustX Strategic Planning Service — Domain Entities
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, Index, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column
from src.models.base import BaseModel

class StrategicPlan(BaseModel):
    """A master strategic plan bounding a set of goals over a time horizon."""
    __tablename__ = "strategic_plans"
    __table_args__ = (
        Index("ix_plan_tenant_status", "tenant_id", "status"),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    horizon: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. "Q3_2026", "FY2027"
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="draft")

class Objective(BaseModel):
    """Specific measurable goals attached to a strategic plan."""
    __tablename__ = "objectives"
    __table_args__ = (
        Index("ix_obj_tenant_plan", "tenant_id", "plan_id"),
    )
    plan_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    objective_name: Mapped[str] = mapped_column(String(255), nullable=False)
    target_value: Mapped[float] = mapped_column(Float, nullable=False)

class Initiative(BaseModel):
    """Specific projects or execution initiatives designed to fulfill objectives."""
    __tablename__ = "initiatives"
    __table_args__ = (
        Index("ix_init_tenant_plan", "tenant_id", "plan_id"),
    )
    plan_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    initiative_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="planned")

class Forecast(BaseModel):
    """Predicted future outcomes modeled off current trajectories vs targets."""
    __tablename__ = "forecasts"
    __table_args__ = (
        Index("ix_forecast_tenant_plan", "tenant_id", "plan_id"),
        Index("ix_forecast_metric", "metric_name"),
    )
    plan_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    metric_name: Mapped[str] = mapped_column(String(255), nullable=False)
    predicted_value: Mapped[float] = mapped_column(Float, nullable=False)
