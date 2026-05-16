"""
MedTrustX Management Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.management import (
    SystemConfig, FeatureFlag, TenantSetting, ServiceConfig, ConfigAuditLog
)
from src.schemas.management import (
    SystemConfigCreate, SystemConfigUpdate,
    FeatureFlagCreate, FeatureFlagUpdate,
    TenantSettingCreate, TenantSettingUpdate,
    ServiceConfigCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

async def _audit(session: AsyncSession, tenant_id: Optional[uuid.UUID], config_key: str, action: str, performed_by: uuid.UUID):
    log = ConfigAuditLog(
        tenant_id=tenant_id,
        config_key=config_key,
        action=action,
        performed_by=performed_by,
    )
    session.add(log)

# ── System Configs ──

async def get_system_config(
    session: AsyncSession, tenant_id: Optional[uuid.UUID], config_key: str
) -> Optional[SystemConfig]:
    # Look for tenant specific first, then fallback to global (tenant_id IS NULL)
    if tenant_id:
        result = await session.execute(
            select(SystemConfig).where(and_(SystemConfig.config_key == config_key, SystemConfig.tenant_id == tenant_id, SystemConfig.deleted_at.is_(None)))
        )
        config = result.scalar_one_or_none()
        if config:
            return config

    result = await session.execute(
        select(SystemConfig).where(and_(SystemConfig.config_key == config_key, SystemConfig.tenant_id.is_(None), SystemConfig.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def upsert_system_config(
    session: AsyncSession, tenant_id: Optional[uuid.UUID], data: SystemConfigCreate, user_id: uuid.UUID
) -> SystemConfig:
    result = await session.execute(
        select(SystemConfig).where(and_(SystemConfig.config_key == data.config_key, SystemConfig.tenant_id == tenant_id, SystemConfig.deleted_at.is_(None)))
    )
    config = result.scalar_one_or_none()
    
    if config:
        config.config_value = data.config_value
        config.updated_at = datetime.now(timezone.utc)
        action = "update"
    else:
        config = SystemConfig(
            tenant_id=tenant_id,
            config_key=data.config_key,
            config_value=data.config_value,
        )
        session.add(config)
        action = "create"
        
    await session.flush()
    await _audit(session, tenant_id, data.config_key, action, user_id)
    await publish_event("CONFIG_UPDATED", tenant_id, config.id, {"config_key": data.config_key})
    return config

# ── Feature Flags ──

async def create_feature_flag(
    session: AsyncSession, tenant_id: uuid.UUID, data: FeatureFlagCreate, user_id: uuid.UUID
) -> FeatureFlag:
    flag = FeatureFlag(
        tenant_id=tenant_id,
        flag_name=data.flag_name,
        enabled=data.enabled,
        conditions=data.conditions,
    )
    session.add(flag)
    await session.flush()
    
    await _audit(session, tenant_id, f"flag:{data.flag_name}", "create", user_id)
    await publish_event("FEATURE_FLAG_TOGGLED", tenant_id, flag.id, {
        "flag_name": flag.flag_name, "enabled": flag.enabled
    })
    return flag

async def get_feature_flag(
    session: AsyncSession, tenant_id: uuid.UUID, flag_id: uuid.UUID
) -> Optional[FeatureFlag]:
    result = await session.execute(
        select(FeatureFlag).where(and_(FeatureFlag.id == flag_id, FeatureFlag.tenant_id == tenant_id, FeatureFlag.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_feature_flag(
    session: AsyncSession, tenant_id: uuid.UUID, flag_id: uuid.UUID, data: FeatureFlagUpdate, user_id: uuid.UUID
) -> Optional[FeatureFlag]:
    flag = await get_feature_flag(session, tenant_id, flag_id)
    if not flag:
        return None
        
    if data.enabled is not None:
        flag.enabled = data.enabled
    if data.conditions is not None:
        flag.conditions = data.conditions
        
    flag.updated_at = datetime.now(timezone.utc)
    await session.flush()
    
    await _audit(session, tenant_id, f"flag:{flag.flag_name}", "update", user_id)
    await publish_event("FEATURE_FLAG_TOGGLED", tenant_id, flag.id, {
        "flag_name": flag.flag_name, "enabled": flag.enabled
    })
    return flag

# ── Tenant Settings ──

async def upsert_tenant_setting(
    session: AsyncSession, tenant_id: uuid.UUID, data: TenantSettingCreate, user_id: uuid.UUID
) -> TenantSetting:
    result = await session.execute(
        select(TenantSetting).where(and_(TenantSetting.tenant_id == tenant_id, TenantSetting.setting_key == data.setting_key, TenantSetting.deleted_at.is_(None)))
    )
    setting = result.scalar_one_or_none()
    
    if setting:
        setting.setting_value = data.setting_value
        setting.updated_at = datetime.now(timezone.utc)
        action = "update"
    else:
        setting = TenantSetting(
            tenant_id=tenant_id,
            setting_key=data.setting_key,
            setting_value=data.setting_value,
        )
        session.add(setting)
        action = "create"
        
    await session.flush()
    await _audit(session, tenant_id, f"tenant_setting:{data.setting_key}", action, user_id)
    await publish_event("TENANT_SETTING_CHANGED", tenant_id, setting.id, {"setting_key": data.setting_key})
    return setting

async def get_tenant_setting(
    session: AsyncSession, tenant_id: uuid.UUID, setting_id: uuid.UUID
) -> Optional[TenantSetting]:
    result = await session.execute(
        select(TenantSetting).where(and_(TenantSetting.id == setting_id, TenantSetting.tenant_id == tenant_id, TenantSetting.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Service Configs ──

async def get_service_config(
    session: AsyncSession, tenant_id: uuid.UUID, service_id: uuid.UUID
) -> Optional[ServiceConfig]:
    result = await session.execute(
        select(ServiceConfig).where(and_(ServiceConfig.id == service_id, ServiceConfig.tenant_id == tenant_id, ServiceConfig.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def create_service_config(
    session: AsyncSession, tenant_id: uuid.UUID, data: ServiceConfigCreate, user_id: uuid.UUID
) -> ServiceConfig:
    config = ServiceConfig(
        tenant_id=tenant_id,
        service_name=data.service_name,
        config=data.config,
    )
    session.add(config)
    await session.flush()
    
    await _audit(session, tenant_id, f"service_config:{data.service_name}", "create", user_id)
    return config

# ── Audit Logs ──

async def get_audit_logs(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[ConfigAuditLog]:
    result = await session.execute(
        select(ConfigAuditLog).where(ConfigAuditLog.tenant_id == tenant_id).order_by(ConfigAuditLog.timestamp.desc()).limit(100)
    )
    return list(result.scalars().all())
