"""
MedTrustX Edge Connectivity Manager Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.edge import ConnectivitySession, EdgeNode, LinkMetric, SyncLog
from src.schemas.edge import ConnectRequest, NodeCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def create_node(session: AsyncSession, tenant_id: uuid.UUID, data: NodeCreate) -> EdgeNode:
    node = EdgeNode(tenant_id=tenant_id, name=data.name, location=data.location)
    session.add(node)
    await session.flush()
    return node


async def get_node(session: AsyncSession, tenant_id: uuid.UUID, node_id: uuid.UUID) -> EdgeNode | None:
    result = await session.execute(
        select(EdgeNode).where(
            and_(EdgeNode.id == node_id, EdgeNode.tenant_id == tenant_id, EdgeNode.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def connect_node(session: AsyncSession, tenant_id: uuid.UUID, data: ConnectRequest) -> ConnectivitySession:
    sess = ConnectivitySession(tenant_id=tenant_id, node_id=data.node_id, tunnel_type=data.tunnel_type)
    session.add(sess)

    # Update node status
    node = await get_node(session, tenant_id, data.node_id)
    if node:
        node.status = "online"

    await session.flush()
    await publish_event("EDGE_CONNECTED", tenant_id, data.node_id, {"tunnel_type": data.tunnel_type})
    return sess


async def list_metrics(session: AsyncSession, tenant_id: uuid.UUID) -> List[LinkMetric]:
    result = await session.execute(
        select(LinkMetric).where(
            and_(LinkMetric.tenant_id == tenant_id, LinkMetric.deleted_at.is_(None))
        ).order_by(LinkMetric.timestamp.desc()).limit(100)
    )
    return list(result.scalars().all())


async def list_sync_logs(session: AsyncSession, tenant_id: uuid.UUID) -> List[SyncLog]:
    result = await session.execute(
        select(SyncLog).where(
            and_(SyncLog.tenant_id == tenant_id, SyncLog.deleted_at.is_(None))
        ).order_by(SyncLog.created_at.desc()).limit(50)
    )
    return list(result.scalars().all())
