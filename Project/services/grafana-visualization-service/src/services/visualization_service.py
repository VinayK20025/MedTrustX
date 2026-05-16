"""
MedTrustX Grafana Visualization Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.grafana import AlertVisualization, Dashboard, DataSource, Panel
from src.schemas.grafana import DashboardCreate, PanelCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Dashboards ──

async def create_dashboard(
    session: AsyncSession, tenant_id: uuid.UUID, data: DashboardCreate
) -> Dashboard:
    dash = Dashboard(
        tenant_id=tenant_id,
        name=data.name,
        config=data.config
    )
    session.add(dash)
    await session.flush()
    await publish_event("DASHBOARD_CREATED", tenant_id, dash.id, {"name": dash.name})
    return dash


async def get_dashboard(
    session: AsyncSession, tenant_id: uuid.UUID, dash_id: uuid.UUID
) -> Dashboard:
    result = await session.execute(
        select(Dashboard).where(and_(Dashboard.id == dash_id, Dashboard.tenant_id == tenant_id, Dashboard.deleted_at.is_(None)))
    )
    dash = result.scalar_one_or_none()
    if dash:
        await publish_event("DASHBOARD_ACCESSED", tenant_id, dash.id, {"name": dash.name})
    return dash


# ── Panels ──

async def create_panel(
    session: AsyncSession, tenant_id: uuid.UUID, data: PanelCreate
) -> Panel:
    panel = Panel(
        tenant_id=tenant_id,
        dashboard_id=data.dashboard_id,
        panel_type=data.panel_type,
        query=data.query,
        config=data.config
    )
    session.add(panel)
    await session.flush()
    return panel


# ── Data Sources ──

async def get_datasources(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[DataSource]:
    result = await session.execute(
        select(DataSource).where(and_(DataSource.tenant_id == tenant_id, DataSource.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Alerts ──

async def get_alert_visualizations(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[AlertVisualization]:
    result = await session.execute(
        select(AlertVisualization).where(and_(AlertVisualization.tenant_id == tenant_id, AlertVisualization.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
