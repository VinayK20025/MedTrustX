"""
MedTrustX User Management Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.user import UserProfile, UserPreference, UserSetting, UserLink, UserStatusLog
from src.schemas.user import (
    UserProfileCreate, UserProfileUpdate, 
    UserPreferenceCreate, UserSettingCreate, UserLinkCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── User Profiles ──

async def create_user_profile(
    session: AsyncSession, tenant_id: uuid.UUID, data: UserProfileCreate
) -> UserProfile:
    profile = UserProfile(
        tenant_id=tenant_id,
        iam_user_id=data.iam_user_id,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        status=data.status,
    )
    session.add(profile)
    
    # Log initial status
    status_log = UserStatusLog(
        tenant_id=tenant_id,
        user_id=profile.id,
        status=data.status
    )
    session.add(status_log)
    
    await session.flush()
    await publish_event("USER_PROFILE_CREATED", tenant_id, profile.id, {"iam_user_id": str(data.iam_user_id)})
    return profile

async def get_user_profile(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID
) -> Optional[UserProfile]:
    result = await session.execute(
        select(UserProfile).where(and_(UserProfile.id == user_id, UserProfile.tenant_id == tenant_id, UserProfile.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_user_profile(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID, data: UserProfileUpdate
) -> Optional[UserProfile]:
    profile = await get_user_profile(session, tenant_id, user_id)
    if not profile:
        return None
        
    old_status = profile.status
    
    if data.first_name is not None: profile.first_name = data.first_name
    if data.last_name is not None: profile.last_name = data.last_name
    if data.email is not None: profile.email = data.email
    if data.phone is not None: profile.phone = data.phone
    
    if data.status is not None and data.status != old_status:
        profile.status = data.status
        status_log = UserStatusLog(
            tenant_id=tenant_id,
            user_id=profile.id,
            status=data.status
        )
        session.add(status_log)
        
    profile.updated_at = datetime.now(timezone.utc)
    await session.flush()
    await publish_event("USER_UPDATED", tenant_id, profile.id)
    return profile

# ── User Preferences ──

async def set_user_preference(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID, data: UserPreferenceCreate
) -> UserPreference:
    result = await session.execute(
        select(UserPreference).where(and_(
            UserPreference.user_id == user_id, 
            UserPreference.preference_key == data.preference_key,
            UserPreference.tenant_id == tenant_id,
            UserPreference.deleted_at.is_(None)
        ))
    )
    pref = result.scalar_one_or_none()
    
    if pref:
        pref.preference_value = data.preference_value
        pref.updated_at = datetime.now(timezone.utc)
    else:
        pref = UserPreference(
            tenant_id=tenant_id,
            user_id=user_id,
            preference_key=data.preference_key,
            preference_value=data.preference_value
        )
        session.add(pref)
        
    await session.flush()
    return pref

async def get_user_preferences(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID
) -> List[UserPreference]:
    result = await session.execute(
        select(UserPreference).where(and_(UserPreference.user_id == user_id, UserPreference.tenant_id == tenant_id, UserPreference.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

# ── User Settings ──

async def set_user_setting(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID, data: UserSettingCreate
) -> UserSetting:
    result = await session.execute(
        select(UserSetting).where(and_(
            UserSetting.user_id == user_id, 
            UserSetting.setting_key == data.setting_key,
            UserSetting.tenant_id == tenant_id,
            UserSetting.deleted_at.is_(None)
        ))
    )
    setting = result.scalar_one_or_none()
    
    if setting:
        setting.setting_value = data.setting_value
        setting.updated_at = datetime.now(timezone.utc)
    else:
        setting = UserSetting(
            tenant_id=tenant_id,
            user_id=user_id,
            setting_key=data.setting_key,
            setting_value=data.setting_value
        )
        session.add(setting)
        
    await session.flush()
    return setting

async def get_user_settings(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID
) -> List[UserSetting]:
    result = await session.execute(
        select(UserSetting).where(and_(UserSetting.user_id == user_id, UserSetting.tenant_id == tenant_id, UserSetting.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

# ── User Links ──

async def create_user_link(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID, data: UserLinkCreate
) -> UserLink:
    link = UserLink(
        tenant_id=tenant_id,
        user_id=user_id,
        entity_type=data.entity_type,
        entity_id=data.entity_id
    )
    session.add(link)
    await session.flush()
    await publish_event("USER_LINKED", tenant_id, user_id, {"entity_type": data.entity_type, "entity_id": str(data.entity_id)})
    return link
