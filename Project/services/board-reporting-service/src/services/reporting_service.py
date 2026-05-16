"""
MedTrustX Board Reporting Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.reporting import Report, ReportDistribution, ReportSchedule, ReportSection
from src.schemas.reporting import ReportCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def create_report(session: AsyncSession, tenant_id: uuid.UUID, data: ReportCreate) -> Report:
    report = Report(tenant_id=tenant_id, title=data.title, type=data.type)
    session.add(report)
    await session.flush()
    return report


async def get_report(session: AsyncSession, tenant_id: uuid.UUID, report_id: uuid.UUID) -> Report | None:
    result = await session.execute(
        select(Report).where(
            and_(Report.id == report_id, Report.tenant_id == tenant_id, Report.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def generate_report(session: AsyncSession, tenant_id: uuid.UUID, report_id: uuid.UUID) -> Report | None:
    report = await get_report(session, tenant_id, report_id)
    if not report:
        return None

    # Auto-populate standard board sections
    standard_sections = [
        ("executive_summary", {"text": "Auto-generated executive summary placeholder"}),
        ("risk_overview", {"risk_count": 0, "critical_risks": 0}),
        ("financial_highlights", {"revenue_trend": "stable", "cost_variance": 0.0}),
        ("operational_metrics", {"uptime": 99.9, "incidents": 0}),
        ("strategic_alignment", {"objectives_on_track": 0, "initiatives_delayed": 0}),
    ]
    for name, content in standard_sections:
        section = ReportSection(tenant_id=tenant_id, report_id=report_id, section_name=name, content=content)
        session.add(section)

    report.status = "generated"
    await session.flush()
    await publish_event("REPORT_GENERATED", tenant_id, report_id, {"title": report.title, "type": report.type})
    return report


async def list_schedules(session: AsyncSession, tenant_id: uuid.UUID) -> List[ReportSchedule]:
    result = await session.execute(
        select(ReportSchedule).where(
            and_(ReportSchedule.tenant_id == tenant_id, ReportSchedule.deleted_at.is_(None))
        ).order_by(ReportSchedule.next_run.asc())
    )
    return list(result.scalars().all())


async def list_distribution(session: AsyncSession, tenant_id: uuid.UUID) -> List[ReportDistribution]:
    result = await session.execute(
        select(ReportDistribution).where(
            and_(ReportDistribution.tenant_id == tenant_id, ReportDistribution.deleted_at.is_(None))
        ).order_by(ReportDistribution.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
