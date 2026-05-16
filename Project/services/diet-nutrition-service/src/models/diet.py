"""
MedTrustX Diet & Nutrition Service — Domain Entities

Five tables orchestrating diet plans, profiles, meal orders, items, and events.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.models.base import BaseModel


class DietPlan(BaseModel):
    """A prescribed clinical diet plan for a patient (e.g., diabetic, renal)."""
    __tablename__ = "diet_plans"
    __table_args__ = (
        Index("ix_diet_plan_pat", "tenant_id", "patient_id"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    diet_type: Mapped[str] = mapped_column(String(100), nullable=False)
    restrictions: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))


class NutritionProfile(BaseModel):
    """A patient's nutritional assessment profile."""
    __tablename__ = "nutrition_profiles"
    __table_args__ = (
        Index("ix_diet_prof_pat", "tenant_id", "patient_id"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    bmi: Mapped[float] = mapped_column(Float, nullable=False)
    caloric_needs: Mapped[int] = mapped_column(Integer, nullable=False)
    allergies: Mapped[dict] = mapped_column(JSONB, nullable=False, default=list, server_default=text("'[]'::jsonb"))


class MealOrder(BaseModel):
    """A specific meal scheduled for delivery to a patient."""
    __tablename__ = "meal_orders"
    __table_args__ = (
        Index("ix_diet_meal_pat", "tenant_id", "patient_id"),
        Index("ix_diet_meal_type", "tenant_id", "meal_type"),
        Index("ix_diet_meal_status", "tenant_id", "status"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    meal_type: Mapped[str] = mapped_column(String(50), nullable=False)  # breakfast, lunch, dinner, snack
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ordered")  # ordered, preparing, delivered
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class MealItem(BaseModel):
    """Specific food items included within a MealOrder."""
    __tablename__ = "meal_items"
    __table_args__ = (
        Index("ix_diet_item_order", "tenant_id", "meal_order_id"),
    )

    meal_order_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    item_name: Mapped[str] = mapped_column(String(100), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)


class DietEvent(BaseModel):
    """Event log for diet state changes, warnings, or anomalies."""
    __tablename__ = "diet_events"
    __table_args__ = (
        Index("ix_diet_ev_pat", "tenant_id", "patient_id"),
    )

    patient_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
