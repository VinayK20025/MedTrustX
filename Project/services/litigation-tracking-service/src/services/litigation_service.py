"""
MedTrustX Litigation Tracking Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.litigation import Hearing, Litigation, LitigationUpdate
from src.schemas.litigation import HearingCreate, LitigationCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def create_litigation(session: AsyncSession, tenant_id: uuid.UUID, data: LitigationCreate) -> Litigation:
    lit = Litigation(tenant_id=tenant_id, case_id=data.case_id, court_name=data.court_name, filed_at=data.filed_at)
    session.add(lit)
    await session.flush()
    await publish_event("LITIGATION_CREATED", tenant_id, lit.id, {"case_id": str(data.case_id)})
    return lit


async def get_litigation(session: AsyncSession, tenant_id: uuid.UUID, lit_id: uuid.UUID) -> Litigation | None:
    result = await session.execute(
        select(Litigation).where(
            and_(Litigation.id == lit_id, Litigation.tenant_id == tenant_id, Litigation.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def schedule_hearing(session: AsyncSession, tenant_id: uuid.UUID, lit_id: uuid.UUID, data: HearingCreate) -> Hearing:
    hearing = Hearing(tenant_id=tenant_id, litigation_id=lit_id, hearing_date=data.hearing_date, notes=data.notes)
    session.add(hearing)
    await session.flush()
    await publish_event("HEARING_SCHEDULED", tenant_id, hearing.id, {"litigation_id": str(lit_id), "date": data.hearing_date.isoformat()})
    return hearing


async def list_hearings(session: AsyncSession, tenant_id: uuid.UUID, lit_id: uuid.UUID) -> List[Hearing]:
    result = await session.execute(
        select(Hearing).where(
            and_(Hearing.litigation_id == lit_id, Hearing.tenant_id == tenant_id, Hearing.deleted_at.is_(None))
        ).order_by(Hearing.hearing_date.asc())
    )
    return list(result.scalars().all())


async def list_updates(session: AsyncSession, tenant_id: uuid.UUID) -> List[LitigationUpdate]:
    result = await session.execute(
        select(LitigationUpdate).where(
            and_(LitigationUpdate.tenant_id == tenant_id, LitigationUpdate.deleted_at.is_(None))
        ).order_by(LitigationUpdate.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
