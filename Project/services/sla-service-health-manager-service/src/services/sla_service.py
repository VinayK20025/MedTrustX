"""
MedTrustX SLA & Service Health Manager Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.sla import HealthEvent, ServiceHealth, SlaDefinition, SlaViolation
from src.schemas.sla import SlaCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── SLAs ──

async def create_sla(session: AsyncSession, tenant_id: uuid.UUID, data: SlaCreate) -> SlaDefinition:
    sla = SlaDefinition(tenant_id=tenant_id, service_name=data.service_name, uptime_target=data.uptime_target, latency_target=data.latency_target)
    session.add(sla)

    # Initialize health record
    health = ServiceHealth(tenant_id=tenant_id, service_name=data.service_name, health_score=100.0, status="healthy")
    session.add(health)
    
    await session.flush()
    return sla


async def get_sla(session: AsyncSession, tenant_id: uuid.UUID, sla_id: uuid.UUID) -> SlaDefinition | None:
    result = await session.execute(select(SlaDefinition).where(and_(SlaDefinition.id == sla_id, SlaDefinition.tenant_id == tenant_id, SlaDefinition.deleted_at.is_(None))))
    return result.scalar_one_or_none()


# ── Health & Violations ──

async def get_health(session: AsyncSession, tenant_id: uuid.UUID, service_name: str) -> ServiceHealth | None:
    result = await session.execute(select(ServiceHealth).where(and_(ServiceHealth.service_name == service_name, ServiceHealth.tenant_id == tenant_id, ServiceHealth.deleted_at.is_(None))))
    return result.scalar_one_or_none()


async def list_violations(session: AsyncSession, tenant_id: uuid.UUID) -> List[SlaViolation]:
    result = await session.execute(select(SlaViolation).where(and_(SlaViolation.tenant_id == tenant_id, SlaViolation.deleted_at.is_(None))).order_by(SlaViolation.detected_at.desc()).limit(100))
    return list(result.scalars().all())


async def list_events(session: AsyncSession, tenant_id: uuid.UUID) -> List[HealthEvent]:
    result = await session.execute(select(HealthEvent).where(and_(HealthEvent.tenant_id == tenant_id, HealthEvent.deleted_at.is_(None))).order_by(HealthEvent.created_at.desc()).limit(100))
    return list(result.scalars().all())
