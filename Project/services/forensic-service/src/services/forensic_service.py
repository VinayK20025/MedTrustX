"""
MedTrustX Forensic Service — Business Logic Layer

MLC Cases, evidence, custody, reports, and requests.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.forensic import (
    CustodyLog,
    EvidenceItem,
    ExternalRequest,
    ForensicReport,
    MLCCase,
)
from src.schemas.forensic import (
    CustodyLogCreate,
    EvidenceItemCreate,
    ExternalRequestCreate,
    ForensicReportCreate,
    MLCCaseCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── MLC Cases ──

async def register_case(
    session: AsyncSession, tenant_id: uuid.UUID, data: MLCCaseCreate
) -> MLCCase:
    mlc_case = MLCCase(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        case_type=data.case_type,
    )
    session.add(mlc_case)
    await session.flush()
    await publish_event("MLC_FLAGGED", tenant_id, mlc_case.id, {"case_type": data.case_type})
    return mlc_case


async def get_case(
    session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID
) -> Optional[MLCCase]:
    result = await session.execute(
        select(MLCCase).where(and_(MLCCase.id == case_id, MLCCase.tenant_id == tenant_id, MLCCase.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Evidence ──

async def collect_evidence(
    session: AsyncSession, tenant_id: uuid.UUID, data: EvidenceItemCreate
) -> EvidenceItem:
    evidence = EvidenceItem(
        tenant_id=tenant_id,
        mlc_case_id=data.mlc_case_id,
        item_type=data.item_type,
        description=data.description,
    )
    session.add(evidence)
    await session.flush()
    await publish_event("EVIDENCE_COLLECTED", tenant_id, evidence.id, {"mlc_case_id": str(data.mlc_case_id)})
    return evidence


async def get_evidence(
    session: AsyncSession, tenant_id: uuid.UUID, evidence_id: uuid.UUID
) -> Optional[EvidenceItem]:
    result = await session.execute(
        select(EvidenceItem).where(and_(EvidenceItem.id == evidence_id, EvidenceItem.tenant_id == tenant_id, EvidenceItem.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Custody Logs ──

async def log_custody(
    session: AsyncSession, tenant_id: uuid.UUID, data: CustodyLogCreate
) -> CustodyLog:
    log = CustodyLog(
        tenant_id=tenant_id,
        evidence_id=data.evidence_id,
        action=data.action,
        performed_by=data.performed_by,
    )
    session.add(log)
    await session.flush()
    await publish_event("CUSTODY_UPDATED", tenant_id, log.id, {"evidence_id": str(data.evidence_id), "action": data.action})
    return log


async def get_custody_logs(
    session: AsyncSession, tenant_id: uuid.UUID, evidence_id: uuid.UUID
) -> List[CustodyLog]:
    result = await session.execute(
        select(CustodyLog).where(and_(CustodyLog.evidence_id == evidence_id, CustodyLog.tenant_id == tenant_id, CustodyLog.deleted_at.is_(None)))
        .order_by(CustodyLog.performed_at.asc())
    )
    return list(result.scalars().all())


# ── Forensic Reports ──

async def submit_report(
    session: AsyncSession, tenant_id: uuid.UUID, data: ForensicReportCreate
) -> ForensicReport:
    report = ForensicReport(
        tenant_id=tenant_id,
        mlc_case_id=data.mlc_case_id,
        findings=data.findings,
    )
    session.add(report)
    await session.flush()
    await publish_event("REPORT_SUBMITTED", tenant_id, report.id, {"mlc_case_id": str(data.mlc_case_id)})
    return report


async def get_report(
    session: AsyncSession, tenant_id: uuid.UUID, report_id: uuid.UUID
) -> Optional[ForensicReport]:
    result = await session.execute(
        select(ForensicReport).where(and_(ForensicReport.id == report_id, ForensicReport.tenant_id == tenant_id, ForensicReport.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── External Requests ──

async def create_external_request(
    session: AsyncSession, tenant_id: uuid.UUID, data: ExternalRequestCreate
) -> ExternalRequest:
    req = ExternalRequest(
        tenant_id=tenant_id,
        mlc_case_id=data.mlc_case_id,
        authority=data.authority,
        request_type=data.request_type,
    )
    session.add(req)
    await session.flush()
    return req


async def get_external_request(
    session: AsyncSession, tenant_id: uuid.UUID, request_id: uuid.UUID
) -> Optional[ExternalRequest]:
    result = await session.execute(
        select(ExternalRequest).where(and_(ExternalRequest.id == request_id, ExternalRequest.tenant_id == tenant_id, ExternalRequest.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()
