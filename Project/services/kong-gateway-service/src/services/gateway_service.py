"""
MedTrustX Kong Gateway Shim Service — Business Logic Layer

CRUD operations for the gateway's admin objects (services, routes,
consumers, plugins) plus edge-level JWT validation logic.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.gateway import (
    GatewayConsumer,
    GatewayPlugin,
    GatewayRoute,
    GatewayService,
)
from src.schemas.gateway import (
    ConsumerCreateRequest,
    PluginCreateRequest,
    RouteCreateRequest,
    ServiceCreateRequest,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Services ──

async def create_service(
    session: AsyncSession, tenant_id: uuid.UUID, data: ServiceCreateRequest
) -> GatewayService:
    svc = GatewayService(
        tenant_id=tenant_id,
        name=data.name,
        url=data.url,
        protocol=data.protocol,
        enabled=data.enabled,
    )
    session.add(svc)
    await session.flush()
    await publish_event("SERVICE_REGISTERED", tenant_id, svc.id, {"name": data.name, "url": data.url})
    return svc


async def get_services(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[GatewayService]:
    result = await session.execute(
        select(GatewayService).where(
            and_(GatewayService.tenant_id == tenant_id, GatewayService.deleted_at.is_(None))
        )
    )
    return list(result.scalars().all())


async def get_service(
    session: AsyncSession, tenant_id: uuid.UUID, service_id: uuid.UUID
) -> Optional[GatewayService]:
    result = await session.execute(
        select(GatewayService).where(
            and_(GatewayService.id == service_id, GatewayService.tenant_id == tenant_id, GatewayService.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── Routes ──

async def create_route(
    session: AsyncSession, tenant_id: uuid.UUID, data: RouteCreateRequest
) -> GatewayRoute:
    route = GatewayRoute(
        tenant_id=tenant_id,
        service_id=data.service_id,
        path=data.path,
        methods=data.methods,
        strip_path=data.strip_path,
    )
    session.add(route)
    await session.flush()
    await publish_event("ROUTE_CREATED", tenant_id, route.id, {"path": data.path})
    return route


async def get_routes(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[GatewayRoute]:
    result = await session.execute(
        select(GatewayRoute).where(
            and_(GatewayRoute.tenant_id == tenant_id, GatewayRoute.deleted_at.is_(None))
        )
    )
    return list(result.scalars().all())


async def get_route(
    session: AsyncSession, tenant_id: uuid.UUID, route_id: uuid.UUID
) -> Optional[GatewayRoute]:
    result = await session.execute(
        select(GatewayRoute).where(
            and_(GatewayRoute.id == route_id, GatewayRoute.tenant_id == tenant_id, GatewayRoute.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── Consumers ──

async def create_consumer(
    session: AsyncSession, tenant_id: uuid.UUID, data: ConsumerCreateRequest
) -> GatewayConsumer:
    consumer = GatewayConsumer(
        tenant_id=tenant_id,
        username=data.username,
        custom_id=data.custom_id,
    )
    session.add(consumer)
    await session.flush()
    await publish_event("CONSUMER_CREATED", tenant_id, consumer.id, {"username": data.username})
    return consumer


async def get_consumers(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[GatewayConsumer]:
    result = await session.execute(
        select(GatewayConsumer).where(
            and_(GatewayConsumer.tenant_id == tenant_id, GatewayConsumer.deleted_at.is_(None))
        )
    )
    return list(result.scalars().all())


async def get_consumer(
    session: AsyncSession, tenant_id: uuid.UUID, consumer_id: uuid.UUID
) -> Optional[GatewayConsumer]:
    result = await session.execute(
        select(GatewayConsumer).where(
            and_(GatewayConsumer.id == consumer_id, GatewayConsumer.tenant_id == tenant_id, GatewayConsumer.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── Plugins ──

async def create_plugin(
    session: AsyncSession, tenant_id: uuid.UUID, data: PluginCreateRequest
) -> GatewayPlugin:
    plugin = GatewayPlugin(
        tenant_id=tenant_id,
        service_id=data.service_id,
        route_id=data.route_id,
        name=data.name,
        config=data.config,
        enabled=data.enabled,
    )
    session.add(plugin)
    await session.flush()
    await publish_event("PLUGIN_APPLIED", tenant_id, plugin.id, {"name": data.name})
    return plugin


async def get_plugins(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[GatewayPlugin]:
    result = await session.execute(
        select(GatewayPlugin).where(
            and_(GatewayPlugin.tenant_id == tenant_id, GatewayPlugin.deleted_at.is_(None))
        )
    )
    return list(result.scalars().all())


async def get_plugin(
    session: AsyncSession, tenant_id: uuid.UUID, plugin_id: uuid.UUID
) -> Optional[GatewayPlugin]:
    result = await session.execute(
        select(GatewayPlugin).where(
            and_(GatewayPlugin.id == plugin_id, GatewayPlugin.tenant_id == tenant_id, GatewayPlugin.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()
