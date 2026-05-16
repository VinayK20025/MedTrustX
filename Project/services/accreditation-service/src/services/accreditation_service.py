"""
MedTrustX Accreditation Service — Business Logic Layer

Programs, Standards, Checklists, Evidence tracking, and Audits.
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.accreditation import (
    AccreditationAudit,
    AccreditationProgram,
    Checklist,
    Evidence,
    Standard,
)
from src.schemas.accreditation import (
    AccreditationAuditCreate,
    ChecklistCreate,
    EvidenceCreate,
    ProgramCreate,
    StandardCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Programs ──

async def create_program(
    session: AsyncSession, tenant_id: uuid.UUID, data: ProgramCreate
) -> AccreditationProgram:
    program = AccreditationProgram(
        tenant_id=tenant_id,
        name=data.name,
        authority=data.authority,
        status="in_preparation",
        expires_at=data.expires_at,
    )
    session.add(program)
    await session.flush()
    return program


async def get_program(
    session: AsyncSession, tenant_id: uuid.UUID, program_id: uuid.UUID
) -> Optional[AccreditationProgram]:
    result = await session.execute(
        select(AccreditationProgram).where(and_(AccreditationProgram.id == program_id, AccreditationProgram.tenant_id == tenant_id, AccreditationProgram.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Standards ──

async def create_standard(
    session: AsyncSession, tenant_id: uuid.UUID, data: StandardCreate
) -> Standard:
    std = Standard(
        tenant_id=tenant_id,
        program_id=data.program_id,
        code=data.code,
        description=data.description,
    )
    session.add(std)
    await session.flush()
    return std


async def get_standard(
    session: AsyncSession, tenant_id: uuid.UUID, std_id: uuid.UUID
) -> Optional[Standard]:
    result = await session.execute(
        select(Standard).where(and_(Standard.id == std_id, Standard.tenant_id == tenant_id, Standard.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Checklists ──

async def create_checklist(
    session: AsyncSession, tenant_id: uuid.UUID, data: ChecklistCreate
) -> Checklist:
    chk = Checklist(
        tenant_id=tenant_id,
        standard_id=data.standard_id,
        item=data.item,
        status="pending",
    )
    session.add(chk)
    await session.flush()
    return chk


async def get_checklist(
    session: AsyncSession, tenant_id: uuid.UUID, chk_id: uuid.UUID
) -> Optional[Checklist]:
    result = await session.execute(
        select(Checklist).where(and_(Checklist.id == chk_id, Checklist.tenant_id == tenant_id, Checklist.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Evidence ──

async def upload_evidence(
    session: AsyncSession, tenant_id: uuid.UUID, data: EvidenceCreate
) -> Evidence:
    ev = Evidence(
        tenant_id=tenant_id,
        checklist_id=data.checklist_id,
        document_url=data.document_url,
        uploaded_by=data.uploaded_by,
    )
    session.add(ev)
    
    # Auto-mark checklist as partial/compliant based on evidence
    chk = await get_checklist(session, tenant_id, data.checklist_id)
    if chk and chk.status == "pending":
        chk.status = "partial"

    await session.flush()
    await publish_event("EVIDENCE_UPLOADED", tenant_id, ev.id, {"checklist_id": str(data.checklist_id)})
    return ev


async def get_evidence(
    session: AsyncSession, tenant_id: uuid.UUID, ev_id: uuid.UUID
) -> Optional[Evidence]:
    result = await session.execute(
        select(Evidence).where(and_(Evidence.id == ev_id, Evidence.tenant_id == tenant_id, Evidence.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Audits ──

async def create_audit(
    session: AsyncSession, tenant_id: uuid.UUID, data: AccreditationAuditCreate
) -> AccreditationAudit:
    audit = AccreditationAudit(
        tenant_id=tenant_id,
        program_id=data.program_id,
        audit_type=data.audit_type,
        status="scheduled",
    )
    session.add(audit)
    await session.flush()
    return audit


async def get_audit(
    session: AsyncSession, tenant_id: uuid.UUID, audit_id: uuid.UUID
) -> Optional[AccreditationAudit]:
    result = await session.execute(
        select(AccreditationAudit).where(and_(AccreditationAudit.id == audit_id, AccreditationAudit.tenant_id == tenant_id, AccreditationAudit.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()
