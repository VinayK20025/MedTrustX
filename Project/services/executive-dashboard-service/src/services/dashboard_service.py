"""
MedTrustX Executive Dashboard Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.dashboard import AccessLog, Dashboard, DashboardWidget, KPI
from src.schemas.dashboard import DashboardCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def create_dashboard(session: AsyncSession, tenant_id: uuid.UUID, data: DashboardCreate) -> Dashboard:
    dash = Dashboard(tenant_id=tenant_id, name=data.name, config=data.config)
    session.add(dash)
    await session.flush()
    return dash


async def get_dashboard(session: AsyncSession, tenant_id: uuid.UUID, dash_id: uuid.UUID, user_id: uuid.UUID) -> Dashboard | None:
    result = await session.execute(
        select(Dashboard).where(
            and_(Dashboard.id == dash_id, Dashboard.tenant_id == tenant_id, Dashboard.deleted_at.is_(None))
        )
    )
    dash = result.scalar_one_or_none()
    if dash:
        log = AccessLog(tenant_id=tenant_id, user_id=user_id, dashboard_id=dash_id)
        session.add(log)
        await session.flush()
        await publish_event("DASHBOARD_VIEWED", tenant_id, dash_id, {"user_id": str(user_id)})
    return dash


async def list_kpis(session: AsyncSession, tenant_id: uuid.UUID) -> List[KPI]:
    result = await session.execute(
        select(KPI).where(
            and_(KPI.tenant_id == tenant_id, KPI.deleted_at.is_(None))
        ).order_by(KPI.timestamp.desc()).limit(100)
    )
    await publish_event("KPI_ACCESSED", tenant_id, None, {"action": "list"})
    return list(result.scalars().all())


async def list_widgets(session: AsyncSession, tenant_id: uuid.UUID) -> List[DashboardWidget]:
    result = await session.execute(
        select(DashboardWidget).where(
            and_(DashboardWidget.tenant_id == tenant_id, DashboardWidget.deleted_at.is_(None))
        )
    )
    return list(result.scalars().all())


async def list_access_logs(session: AsyncSession, tenant_id: uuid.UUID) -> List[AccessLog]:
    result = await session.execute(
        select(AccessLog).where(
            and_(AccessLog.tenant_id == tenant_id, AccessLog.deleted_at.is_(None))
        ).order_by(AccessLog.accessed_at.desc()).limit(100)
    )
    return list(result.scalars().all())
