"""
MedTrustX Evidence Management Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.evidence import AccessRecord, CustodyLog, EvidenceItem, EvidenceMetadata
from src.schemas.evidence import CustodyCreate, EvidenceCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def ingest_evidence(session: AsyncSession, tenant_id: uuid.UUID, data: EvidenceCreate) -> EvidenceItem:
    item = EvidenceItem(tenant_id=tenant_id, case_id=data.case_id, type=data.type, file_path=data.file_path, hash=data.hash)
    session.add(item)
    await session.flush()
    await publish_event("EVIDENCE_CREATED", tenant_id, item.id, {"type": data.type, "case_id": str(data.case_id)})
    return item


async def get_evidence(session: AsyncSession, tenant_id: uuid.UUID, evidence_id: uuid.UUID) -> EvidenceItem | None:
    result = await session.execute(
        select(EvidenceItem).where(
            and_(EvidenceItem.id == evidence_id, EvidenceItem.tenant_id == tenant_id, EvidenceItem.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def update_custody(session: AsyncSession, tenant_id: uuid.UUID, evidence_id: uuid.UUID, data: CustodyCreate) -> CustodyLog:
    log = CustodyLog(tenant_id=tenant_id, evidence_id=evidence_id, action=data.action, performed_by=data.performed_by)
    session.add(log)
    await session.flush()
    await publish_event("CUSTODY_UPDATED", tenant_id, log.id, {"evidence_id": str(evidence_id), "action": data.action})
    return log


async def get_metadata(session: AsyncSession, tenant_id: uuid.UUID, evidence_id: uuid.UUID) -> EvidenceMetadata | None:
    result = await session.execute(
        select(EvidenceMetadata).where(
            and_(EvidenceMetadata.evidence_id == evidence_id, EvidenceMetadata.tenant_id == tenant_id, EvidenceMetadata.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def list_access_records(session: AsyncSession, tenant_id: uuid.UUID) -> List[AccessRecord]:
    result = await session.execute(
        select(AccessRecord).where(
            and_(AccessRecord.tenant_id == tenant_id, AccessRecord.deleted_at.is_(None))
        ).order_by(AccessRecord.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
