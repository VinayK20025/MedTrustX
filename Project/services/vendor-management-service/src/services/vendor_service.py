"""
MedTrustX Vendor Management Service — Business Logic Layer

Vendors, contracts, SLAs, performance, and risk management.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.vendor import (
    SLA,
    Vendor,
    VendorContract,
    VendorPerformance,
    VendorRisk,
)
from src.schemas.vendor import (
    SLACreate,
    VendorContractCreate,
    VendorCreate,
    VendorPerformanceCreate,
    VendorRiskCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Vendors ──

async def onboard_vendor(
    session: AsyncSession, tenant_id: uuid.UUID, data: VendorCreate
) -> Vendor:
    vendor = Vendor(
        tenant_id=tenant_id,
        name=data.name,
        vendor_type=data.vendor_type,
    )
    session.add(vendor)
    await session.flush()
    await publish_event("VENDOR_ONBOARDED", tenant_id, vendor.id, {"vendor_type": data.vendor_type})
    return vendor


async def get_vendor(
    session: AsyncSession, tenant_id: uuid.UUID, vendor_id: uuid.UUID
) -> Optional[Vendor]:
    result = await session.execute(
        select(Vendor).where(and_(Vendor.id == vendor_id, Vendor.tenant_id == tenant_id, Vendor.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Contracts ──

async def create_contract(
    session: AsyncSession, tenant_id: uuid.UUID, data: VendorContractCreate
) -> VendorContract:
    contract = VendorContract(
        tenant_id=tenant_id,
        vendor_id=data.vendor_id,
        contract_details=data.contract_details,
        start_date=data.start_date,
        end_date=data.end_date,
    )
    session.add(contract)
    await session.flush()
    await publish_event("CONTRACT_CREATED", tenant_id, contract.id, {"vendor_id": str(data.vendor_id)})
    return contract


async def get_contract(
    session: AsyncSession, tenant_id: uuid.UUID, contract_id: uuid.UUID
) -> Optional[VendorContract]:
    result = await session.execute(
        select(VendorContract).where(and_(VendorContract.id == contract_id, VendorContract.tenant_id == tenant_id, VendorContract.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── SLAs ──

async def create_sla(
    session: AsyncSession, tenant_id: uuid.UUID, data: SLACreate
) -> SLA:
    sla = SLA(
        tenant_id=tenant_id,
        vendor_id=data.vendor_id,
        metric=data.metric,
        target_value=data.target_value,
    )
    session.add(sla)
    await session.flush()
    return sla


async def get_vendor_slas(
    session: AsyncSession, tenant_id: uuid.UUID, vendor_id: uuid.UUID
) -> List[SLA]:
    result = await session.execute(
        select(SLA).where(and_(SLA.vendor_id == vendor_id, SLA.tenant_id == tenant_id, SLA.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Performance ──

async def record_performance(
    session: AsyncSession, tenant_id: uuid.UUID, data: VendorPerformanceCreate
) -> VendorPerformance:
    perf = VendorPerformance(
        tenant_id=tenant_id,
        vendor_id=data.vendor_id,
        kpi=data.kpi,
        value=data.value,
    )
    session.add(perf)
    await session.flush()
    
    # Simple SLA breach check logic could go here
    # Example: if lower is better and value > sla.target
    await publish_event("PERFORMANCE_RECORDED", tenant_id, perf.id, {"vendor_id": str(data.vendor_id), "kpi": data.kpi})
    return perf


async def get_vendor_performance(
    session: AsyncSession, tenant_id: uuid.UUID, vendor_id: uuid.UUID, limit: int = 50
) -> List[VendorPerformance]:
    result = await session.execute(
        select(VendorPerformance).where(and_(VendorPerformance.vendor_id == vendor_id, VendorPerformance.tenant_id == tenant_id, VendorPerformance.deleted_at.is_(None)))
        .order_by(VendorPerformance.recorded_at.desc()).limit(limit)
    )
    return list(result.scalars().all())


# ── Risks ──

async def update_vendor_risk(
    session: AsyncSession, tenant_id: uuid.UUID, data: VendorRiskCreate
) -> VendorRisk:
    risk = VendorRisk(
        tenant_id=tenant_id,
        vendor_id=data.vendor_id,
        risk_type=data.risk_type,
        score=data.score,
    )
    session.add(risk)
    await session.flush()
    await publish_event("VENDOR_RISK_UPDATED", tenant_id, risk.id, {"vendor_id": str(data.vendor_id), "score": data.score})
    return risk


async def get_vendor_risks(
    session: AsyncSession, tenant_id: uuid.UUID, vendor_id: uuid.UUID
) -> List[VendorRisk]:
    result = await session.execute(
        select(VendorRisk).where(and_(VendorRisk.vendor_id == vendor_id, VendorRisk.tenant_id == tenant_id, VendorRisk.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
