"""
MedTrustX Configuration Service — Business Logic Layer

Configs, feature flags, environments, and version snapshots.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.configuration import (
    Configuration,
    FeatureFlag,
    Environment,
    ConfigVersion,
)
from src.schemas.configuration import (
    ConfigurationCreate,
    FeatureFlagCreate,
    EnvironmentCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Configurations ──

async def set_configuration(
    session: AsyncSession, tenant_id: uuid.UUID, data: ConfigurationCreate
) -> Configuration:
    result = await session.execute(
        select(Configuration).where(
            and_(
                Configuration.service_name == data.service_name,
                Configuration.config_key == data.config_key,
                Configuration.tenant_id == tenant_id,
                Configuration.deleted_at.is_(None)
            )
        )
    )
    config = result.scalar_one_or_none()

    if config:
        config.config_value = data.config_value
    else:
        config = Configuration(
            tenant_id=tenant_id,
            service_name=data.service_name,
            config_key=data.config_key,
            config_value=data.config_value,
        )
        session.add(config)

    await session.flush()
    await publish_event(
        "CONFIG_UPDATED",
        tenant_id,
        config.id,
        {"service": data.service_name, "key": data.config_key}
    )
    return config


async def get_configuration(
    session: AsyncSession, tenant_id: uuid.UUID, service_name: str
) -> List[Configuration]:
    result = await session.execute(
        select(Configuration).where(
            and_(
                Configuration.service_name == service_name,
                Configuration.tenant_id == tenant_id,
                Configuration.deleted_at.is_(None)
            )
        )
    )
    return list(result.scalars().all())


# ── Feature Flags ──

async def set_feature_flag(
    session: AsyncSession, tenant_id: uuid.UUID, data: FeatureFlagCreate
) -> FeatureFlag:
    result = await session.execute(
        select(FeatureFlag).where(
            and_(
                FeatureFlag.flag_name == data.flag_name,
                FeatureFlag.tenant_id == tenant_id,
                FeatureFlag.deleted_at.is_(None)
            )
        )
    )
    flag = result.scalar_one_or_none()

    if flag:
        flag.enabled = data.enabled
    else:
        flag = FeatureFlag(
            tenant_id=tenant_id,
            flag_name=data.flag_name,
            enabled=data.enabled,
        )
        session.add(flag)

    await session.flush()
    await publish_event(
        "FEATURE_FLAG_CHANGED",
        tenant_id,
        flag.id,
        {"flag": data.flag_name, "enabled": data.enabled}
    )
    return flag


async def get_feature_flags(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[FeatureFlag]:
    result = await session.execute(
        select(FeatureFlag).where(
            and_(
                FeatureFlag.tenant_id == tenant_id,
                FeatureFlag.deleted_at.is_(None)
            )
        )
    )
    return list(result.scalars().all())


# ── Environments ──

async def create_environment(
    session: AsyncSession, tenant_id: uuid.UUID, data: EnvironmentCreate
) -> Environment:
    env = Environment(
        tenant_id=tenant_id,
        name=data.name,
        description=data.description,
    )
    session.add(env)
    await session.flush()
    return env


async def get_environments(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[Environment]:
    result = await session.execute(
        select(Environment).where(
            and_(
                Environment.tenant_id == tenant_id,
                Environment.deleted_at.is_(None)
            )
        )
    )
    return list(result.scalars().all())


# ── Versions ──

async def get_config_versions(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[ConfigVersion]:
    result = await session.execute(
        select(ConfigVersion).where(
            and_(
                ConfigVersion.tenant_id == tenant_id,
                ConfigVersion.deleted_at.is_(None)
            )
        )
    )
    return list(result.scalars().all())
