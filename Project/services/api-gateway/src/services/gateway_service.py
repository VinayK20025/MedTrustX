"""
MedTrustX Internal API Gateway — Configuration Management Layer
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.gateway import GatewayPolicy, GatewayRateLimit, GatewayRoute
from src.schemas.gateway import (
    GatewayPolicyCreate,
    GatewayRateLimitCreate,
    GatewayRouteCreate,
    GatewayRouteUpdate,
)

logger = structlog.get_logger()


# ── Routes ──────────────────────────────────────────────────────
async def create_route(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: GatewayRouteCreate,
) -> GatewayRoute:
    route = GatewayRoute(
        tenant_id=tenant_id,
        service_name=data.service_name,
        path=data.path,
        method=data.method,
        upstream_url=data.upstream_url,
        active=data.active,
    )
    session.add(route)
    await session.flush()
    return route


async def get_route(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    route_id: uuid.UUID,
) -> Optional[GatewayRoute]:
    result = await session.execute(
        select(GatewayRoute)
        .where(
            and_(
                GatewayRoute.id == route_id,
                GatewayRoute.tenant_id == tenant_id,
                GatewayRoute.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def get_all_routes(
    session: AsyncSession,
    tenant_id: uuid.UUID,
) -> List[GatewayRoute]:
    result = await session.execute(
        select(GatewayRoute)
        .where(
            and_(
                GatewayRoute.tenant_id == tenant_id,
                GatewayRoute.deleted_at.is_(None),
                GatewayRoute.active == True,
            )
        )
    )
    return list(result.scalars().all())


async def update_route(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    route_id: uuid.UUID,
    data: GatewayRouteUpdate,
) -> Optional[GatewayRoute]:
    route = await get_route(session, tenant_id, route_id)
    if not route:
        return None

    if data.service_name is not None:
        route.service_name = data.service_name
    if data.path is not None:
        route.path = data.path
    if data.method is not None:
        route.method = data.method
    if data.upstream_url is not None:
        route.upstream_url = data.upstream_url
    if data.active is not None:
        route.active = data.active

    await session.flush()
    return route


# ── Policies ────────────────────────────────────────────────────
async def create_policy(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: GatewayPolicyCreate,
) -> GatewayPolicy:
    policy = GatewayPolicy(
        tenant_id=tenant_id,
        policy_type=data.policy_type,
        config=data.config,
        applied_to=data.applied_to,
    )
    session.add(policy)
    await session.flush()
    return policy


async def get_policy(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    policy_id: uuid.UUID,
) -> Optional[GatewayPolicy]:
    result = await session.execute(
        select(GatewayPolicy)
        .where(
            and_(
                GatewayPolicy.id == policy_id,
                GatewayPolicy.tenant_id == tenant_id,
                GatewayPolicy.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


# ── Rate Limits ─────────────────────────────────────────────────
async def create_rate_limit(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: GatewayRateLimitCreate,
) -> GatewayRateLimit:
    limit = GatewayRateLimit(
        tenant_id=tenant_id,
        key=data.key,
        limit_per_min=data.limit_per_min,
        burst=data.burst,
    )
    session.add(limit)
    await session.flush()
    return limit


async def get_rate_limit(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    limit_id: uuid.UUID,
) -> Optional[GatewayRateLimit]:
    result = await session.execute(
        select(GatewayRateLimit)
        .where(
            and_(
                GatewayRateLimit.id == limit_id,
                GatewayRateLimit.tenant_id == tenant_id,
                GatewayRateLimit.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()
