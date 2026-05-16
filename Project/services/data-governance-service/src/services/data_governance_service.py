"""
MedTrustX Data Governance Service — Business Logic Layer

Assets cataloging, classifications, lineage, quality rules, and retention.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.data_governance import (
    DataAsset,
    DataClassification,
    DataLineage,
    DataQualityRule,
    DataRetentionPolicy,
)
from src.schemas.data_governance import (
    DataAssetCreate,
    DataClassificationCreate,
    DataLineageCreate,
    DataQualityRuleCreate,
    DataRetentionPolicyCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Assets ──

async def create_asset(
    session: AsyncSession, tenant_id: uuid.UUID, data: DataAssetCreate
) -> DataAsset:
    asset = DataAsset(
        tenant_id=tenant_id,
        name=data.name,
        type=data.type,
        owner=data.owner,
    )
    session.add(asset)
    await session.flush()
    await publish_event("DATA_ASSET_REGISTERED", tenant_id, asset.id, {"type": data.type, "owner": data.owner})
    return asset


async def get_asset(
    session: AsyncSession, tenant_id: uuid.UUID, asset_id: uuid.UUID
) -> Optional[DataAsset]:
    result = await session.execute(
        select(DataAsset).where(and_(DataAsset.id == asset_id, DataAsset.tenant_id == tenant_id, DataAsset.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Classifications ──

async def create_classification(
    session: AsyncSession, tenant_id: uuid.UUID, data: DataClassificationCreate
) -> DataClassification:
    classification = DataClassification(
        tenant_id=tenant_id,
        asset_id=data.asset_id,
        classification=data.classification,
        sensitivity_level=data.sensitivity_level,
    )
    session.add(classification)
    await session.flush()
    await publish_event("DATA_CLASSIFIED", tenant_id, data.asset_id, {"classification": data.classification, "sensitivity": data.sensitivity_level})
    return classification


async def get_classification(
    session: AsyncSession, tenant_id: uuid.UUID, classification_id: uuid.UUID
) -> Optional[DataClassification]:
    result = await session.execute(
        select(DataClassification).where(and_(DataClassification.id == classification_id, DataClassification.tenant_id == tenant_id, DataClassification.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Lineage ──

async def record_lineage(
    session: AsyncSession, tenant_id: uuid.UUID, data: DataLineageCreate
) -> DataLineage:
    lineage = DataLineage(
        tenant_id=tenant_id,
        source_asset=data.source_asset,
        target_asset=data.target_asset,
        transformation=data.transformation,
    )
    session.add(lineage)
    await session.flush()
    return lineage


async def get_lineage(
    session: AsyncSession, tenant_id: uuid.UUID, asset_id: uuid.UUID
) -> List[DataLineage]:
    # Returns upstream and downstream lineage
    result = await session.execute(
        select(DataLineage).where(
            and_(
                DataLineage.tenant_id == tenant_id,
                DataLineage.deleted_at.is_(None),
                (DataLineage.source_asset == asset_id) | (DataLineage.target_asset == asset_id)
            )
        )
    )
    return list(result.scalars().all())


# ── Quality Rules ──

async def create_quality_rule(
    session: AsyncSession, tenant_id: uuid.UUID, data: DataQualityRuleCreate
) -> DataQualityRule:
    rule = DataQualityRule(
        tenant_id=tenant_id,
        asset_id=data.asset_id,
        rule=data.rule,
        status="active",
    )
    session.add(rule)
    await session.flush()
    return rule


async def get_quality_rule(
    session: AsyncSession, tenant_id: uuid.UUID, rule_id: uuid.UUID
) -> Optional[DataQualityRule]:
    result = await session.execute(
        select(DataQualityRule).where(and_(DataQualityRule.id == rule_id, DataQualityRule.tenant_id == tenant_id, DataQualityRule.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Retention Policies ──

async def create_retention_policy(
    session: AsyncSession, tenant_id: uuid.UUID, data: DataRetentionPolicyCreate
) -> DataRetentionPolicy:
    policy = DataRetentionPolicy(
        tenant_id=tenant_id,
        asset_id=data.asset_id,
        retention_period=data.retention_period,
        action=data.action,
    )
    session.add(policy)
    await session.flush()
    return policy


async def get_retention_policies(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[DataRetentionPolicy]:
    result = await session.execute(
        select(DataRetentionPolicy).where(and_(DataRetentionPolicy.tenant_id == tenant_id, DataRetentionPolicy.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
