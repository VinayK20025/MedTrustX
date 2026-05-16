"""
MedTrustX Visitor Management Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.visitor import Badge, Visit, VisitLog, Visitor
from src.schemas.visitor import VisitCreate, VisitorCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Visitors ──

async def create_visitor(session: AsyncSession, tenant_id: uuid.UUID, data: VisitorCreate) -> Visitor:
    v = Visitor(tenant_id=tenant_id, name=data.name, id_type=data.id_type, id_value=data.id_value)
    session.add(v)
    await session.flush()
    await publish_event("VISITOR_REGISTERED", tenant_id, v.id, {"name": v.name})
    return v


# ── Visits ──

async def create_visit(session: AsyncSession, tenant_id: uuid.UUID, data: VisitCreate) -> Visit:
    v = Visit(tenant_id=tenant_id, visitor_id=data.visitor_id, host_id=data.host_id, purpose=data.purpose)
    session.add(v)
    await session.flush()
    return v


async def get_visit(session: AsyncSession, tenant_id: uuid.UUID, visit_id: uuid.UUID) -> Visit | None:
    result = await session.execute(
        select(Visit).where(and_(Visit.id == visit_id, Visit.tenant_id == tenant_id, Visit.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Check-in / Check-out ──

async def check_in(session: AsyncSession, tenant_id: uuid.UUID, visit_id: uuid.UUID) -> Visit | None:
    v = await get_visit(session, tenant_id, visit_id)
    if not v or v.status != "scheduled":
        return None
    
    v.status = "active"
    v.check_in = datetime.now(timezone.utc)
    
    # Generate Badge
    b = Badge(tenant_id=tenant_id, visit_id=v.id, badge_code=f"V-{str(uuid.uuid4())[:8]}")
    session.add(b)
    
    # Log
    log = VisitLog(tenant_id=tenant_id, visit_id=v.id, event_type="check_in")
    session.add(log)
    
    await session.flush()
    await publish_event("VISITOR_CHECKED_IN", tenant_id, v.id, {"visitor_id": str(v.visitor_id), "badge_code": b.badge_code})
    return v


async def check_out(session: AsyncSession, tenant_id: uuid.UUID, visit_id: uuid.UUID) -> Visit | None:
    v = await get_visit(session, tenant_id, visit_id)
    if not v or v.status != "active":
        return None
    
    v.status = "completed"
    v.check_out = datetime.now(timezone.utc)
    
    # Log
    log = VisitLog(tenant_id=tenant_id, visit_id=v.id, event_type="check_out")
    session.add(log)
    
    await session.flush()
    await publish_event("VISITOR_CHECKED_OUT", tenant_id, v.id, {"visitor_id": str(v.visitor_id)})
    return v


async def list_logs(session: AsyncSession, tenant_id: uuid.UUID) -> List[VisitLog]:
    result = await session.execute(
        select(VisitLog).where(
            and_(VisitLog.tenant_id == tenant_id, VisitLog.deleted_at.is_(None))
        ).order_by(VisitLog.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
