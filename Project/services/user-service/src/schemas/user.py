"""
MedTrustX User Management Service — Pydantic v2 Schemas
"""
import uuid
from datetime import datetime
from typing import Dict, Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr

# ── User Profile ──
class UserProfileCreate(BaseModel):
    iam_user_id: uuid.UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: str = "active"

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None

class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    iam_user_id: uuid.UUID
    tenant_id: uuid.UUID
    first_name: Optional[str]
    last_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    status: str
    created_at: datetime

# ── User Preferences ──
class UserPreferenceCreate(BaseModel):
    preference_key: str
    preference_value: Dict[str, Any]

class UserPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    preference_key: str
    preference_value: Dict[str, Any]

# ── User Settings ──
class UserSettingCreate(BaseModel):
    setting_key: str
    setting_value: Dict[str, Any]

class UserSettingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    setting_key: str
    setting_value: Dict[str, Any]

# ── User Links ──
class UserLinkCreate(BaseModel):
    entity_type: str
    entity_id: uuid.UUID

class UserLinkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    entity_type: str
    entity_id: uuid.UUID
    linked_at: datetime
