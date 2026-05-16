"""
MedTrustX Legal Case Management Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.legal import CaseDocument, CaseTask, ComplianceRecord, LegalCase
from src.schemas.legal import CaseCreate, DocumentCreate, TaskCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def create_case(session: AsyncSession, tenant_id: uuid.UUID, data: CaseCreate) -> LegalCase:
    case = LegalCase(tenant_id=tenant_id, case_number=data.case_number, type=data.type)
    session.add(case)
    await session.flush()
    await publish_event("CASE_CREATED", tenant_id, case.id, {"type": data.type})
    return case


async def get_case(session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID) -> LegalCase | None:
    result = await session.execute(
        select(LegalCase).where(
            and_(LegalCase.id == case_id, LegalCase.tenant_id == tenant_id, LegalCase.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


async def add_document(session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID, data: DocumentCreate) -> CaseDocument:
    doc = CaseDocument(tenant_id=tenant_id, case_id=case_id, document_type=data.document_type, file_path=data.file_path)
    session.add(doc)
    await session.flush()
    return doc


async def add_task(session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID, data: TaskCreate) -> CaseTask:
    task = CaseTask(tenant_id=tenant_id, case_id=case_id, task_name=data.task_name, assigned_to=data.assigned_to)
    session.add(task)
    await session.flush()
    await publish_event("TASK_ASSIGNED", tenant_id, task.id, {"case_id": str(case_id), "assigned_to": str(data.assigned_to)})
    return task


async def list_compliance(session: AsyncSession, tenant_id: uuid.UUID) -> List[ComplianceRecord]:
    result = await session.execute(
        select(ComplianceRecord).where(
            and_(ComplianceRecord.tenant_id == tenant_id, ComplianceRecord.deleted_at.is_(None))
        ).order_by(ComplianceRecord.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
