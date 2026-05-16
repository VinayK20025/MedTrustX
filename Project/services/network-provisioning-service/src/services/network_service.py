"""
MedTrustX Network Provisioning Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.network import IPAllocation, Network, NetworkDevice, Subnet
from src.schemas.network import IPAllocate, NetworkCreate, SubnetCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Networks & Subnets ──

async def create_network(session: AsyncSession, tenant_id: uuid.UUID, data: NetworkCreate) -> Network:
    net = Network(tenant_id=tenant_id, name=data.name, cidr=data.cidr)
    session.add(net)
    await session.flush()
    await publish_event("NETWORK_PROVISIONED", tenant_id, net.id, {"cidr": data.cidr})
    return net


async def get_network(session: AsyncSession, tenant_id: uuid.UUID, network_id: uuid.UUID) -> Network | None:
    result = await session.execute(
        select(Network).where(
            and_(Network.id == network_id, Network.tenant_id == tenant_id, Network.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def create_subnet(session: AsyncSession, tenant_id: uuid.UUID, data: SubnetCreate) -> Subnet:
    sub = Subnet(tenant_id=tenant_id, network_id=data.network_id, cidr=data.cidr)
    session.add(sub)
    await session.flush()
    return sub


# ── IPs & Devices ──

async def allocate_ip(session: AsyncSession, tenant_id: uuid.UUID, data: IPAllocate) -> IPAllocation:
    ip = IPAllocation(tenant_id=tenant_id, subnet_id=data.subnet_id, ip_address=data.ip_address, assigned_to=data.assigned_to)
    session.add(ip)
    await session.flush()
    await publish_event("IP_ALLOCATED", tenant_id, ip.id, {"ip": data.ip_address, "assigned_to": data.assigned_to})
    return ip


async def list_devices(session: AsyncSession, tenant_id: uuid.UUID) -> List[NetworkDevice]:
    result = await session.execute(
        select(NetworkDevice).where(
            and_(NetworkDevice.tenant_id == tenant_id, NetworkDevice.deleted_at.is_(None))
        ).limit(100)
    )
    return list(result.scalars().all())
