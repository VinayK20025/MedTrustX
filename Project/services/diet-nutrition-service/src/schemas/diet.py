"""
MedTrustX Diet & Nutrition Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


# ── Diet Plans ──

class DietPlanCreate(BaseModel):
    patient_id: uuid.UUID
    diet_type: str
    restrictions: Dict[str, Any]


class DietPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    diet_type: str
    restrictions: Dict[str, Any]
    created_at: datetime


# ── Nutrition Profiles ──

class NutritionProfileCreate(BaseModel):
    patient_id: uuid.UUID
    bmi: float
    caloric_needs: int
    allergies: List[Dict[str, Any]]


class NutritionProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    bmi: float
    caloric_needs: int
    allergies: List[Dict[str, Any]]
    updated_at: datetime


# ── Meal Orders ──

class MealOrderCreate(BaseModel):
    patient_id: uuid.UUID
    meal_type: str
    scheduled_at: datetime


class MealOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    meal_type: str
    status: str
    scheduled_at: datetime


# ── Diet Events ──

class DietEventCreate(BaseModel):
    patient_id: uuid.UUID
    event_type: str
    payload: Dict[str, Any]


class DietEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    patient_id: uuid.UUID
    event_type: str
    payload: Dict[str, Any]
    created_at: datetime
