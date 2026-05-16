"""
MedTrustX Multi-Tenant Isolation Manager Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.isolation import AccessLog, ContextPropagation, IsolationPolicy, Tenant
from src.schemas.isolation import PolicyCreate, TenantCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Tenant Management ──

async def create_tenant(session: AsyncSession, tenant_id: uuid.UUID, data: TenantCreate) -> Tenant:
    # Notice: Tenant creation uses the incoming ID to map to the DB record representing the boundary
    t = Tenant(id=tenant_id, tenant_id=tenant_id, name=data.name)
    session.add(t)
    await session.flush()
    return t


async def get_tenant(session: AsyncSession, tenant_id: uuid.UUID, lookup_id: uuid.UUID) -> Tenant | None:
    result = await session.execute(select(Tenant).where(and_(Tenant.id == lookup_id, Tenant.tenant_id == tenant_id, Tenant.deleted_at.is_(None))))
    return result.scalar_one_or_none()


# ── Policy Enforcement ──

async def create_policy(session: AsyncSession, tenant_id: uuid.UUID, data: PolicyCreate) -> IsolationPolicy:
    p = IsolationPolicy(tenant_id=tenant_id, policy_name=data.policy_name, rules=data.rules)
    session.add(p)
    await session.flush()
    
    await publish_event("POLICY_UPDATED", tenant_id, p.id, {"policy_name": data.policy_name})
    return p


# ── Audit & Context ──

async def list_access_logs(session: AsyncSession, tenant_id: uuid.UUID) -> List[AccessLog]:
    result = await session.execute(select(AccessLog).where(and_(AccessLog.tenant_id == tenant_id, AccessLog.deleted_at.is_(None))).order_by(AccessLog.created_at.desc()).limit(100))
    return list(result.scalars().all())


async def list_context(session: AsyncSession, tenant_id: uuid.UUID) -> List[ContextPropagation]:
    result = await session.execute(select(ContextPropagation).where(and_(ContextPropagation.tenant_id == tenant_id, ContextPropagation.deleted_at.is_(None))).order_by(ContextPropagation.propagated_at.desc()).limit(100))
    return list(result.scalars().all())
