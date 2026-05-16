"""
MedTrustX Data Fabric / Integration Hub Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.fabric import DataPipeline, IntegrationEvent, SchemaRegistry, Transformation
from src.schemas.fabric import PipelineCreate, TransformationCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Pipelines ──

async def create_pipeline(session: AsyncSession, tenant_id: uuid.UUID, data: PipelineCreate) -> DataPipeline:
    pipeline = DataPipeline(tenant_id=tenant_id, name=data.name, source=data.source, destination=data.destination, status="idle")
    session.add(pipeline)
    await session.flush()
    # Record pipeline creation event
    evt = IntegrationEvent(tenant_id=tenant_id, pipeline_id=pipeline.id, event_type="PIPELINE_CREATED", payload={"name": data.name, "source": data.source, "destination": data.destination})
    session.add(evt)
    await session.flush()
    return pipeline


async def get_pipeline(session: AsyncSession, tenant_id: uuid.UUID, pipeline_id: uuid.UUID) -> DataPipeline | None:
    result = await session.execute(select(DataPipeline).where(and_(DataPipeline.id == pipeline_id, DataPipeline.tenant_id == tenant_id, DataPipeline.deleted_at.is_(None))))
    return result.scalar_one_or_none()


# ── Transformations ──

async def create_transformation(session: AsyncSession, tenant_id: uuid.UUID, data: TransformationCreate) -> Transformation:
    transform = Transformation(tenant_id=tenant_id, pipeline_id=data.pipeline_id, mapping=data.mapping)
    session.add(transform)
    await session.flush()

    # Simulate pipeline execution
    pipeline = await get_pipeline(session, tenant_id, data.pipeline_id)
    if pipeline:
        pipeline.status = "completed"
        evt = IntegrationEvent(tenant_id=tenant_id, pipeline_id=data.pipeline_id, event_type="PIPELINE_EXECUTED", payload={"mapping_keys": list(data.mapping.keys())})
        session.add(evt)
        await session.flush()
        await publish_event("PIPELINE_EXECUTED", tenant_id, data.pipeline_id, {"status": "completed"})
        await publish_event("DATA_TRANSFORMED", tenant_id, transform.id, {"pipeline_id": str(data.pipeline_id)})

    return transform


# ── Schemas ──

async def list_schemas(session: AsyncSession, tenant_id: uuid.UUID) -> List[SchemaRegistry]:
    result = await session.execute(select(SchemaRegistry).where(and_(SchemaRegistry.tenant_id == tenant_id, SchemaRegistry.deleted_at.is_(None))).order_by(SchemaRegistry.created_at.desc()))
    return list(result.scalars().all())


# ── Events ──

async def list_events(session: AsyncSession, tenant_id: uuid.UUID) -> List[IntegrationEvent]:
    result = await session.execute(select(IntegrationEvent).where(and_(IntegrationEvent.tenant_id == tenant_id, IntegrationEvent.deleted_at.is_(None))).order_by(IntegrationEvent.created_at.desc()).limit(100))
    return list(result.scalars().all())
