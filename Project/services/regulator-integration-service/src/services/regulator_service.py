"""
MedTrustX Regulator Integration Service — Business Logic Layer

Regulators, reports, submissions, and acknowledgments.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.regulator import (
    Acknowledgment,
    Regulator,
    ReportDefinition,
    Submission,
)
from src.schemas.regulator import (
    RegulatorCreate,
    SubmissionCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Regulators ──

async def create_regulator(
    session: AsyncSession, tenant_id: uuid.UUID, data: RegulatorCreate
) -> Regulator:
    regulator = Regulator(
        tenant_id=tenant_id,
        name=data.name,
        authority_type=data.authority_type,
        api_endpoint=data.api_endpoint,
    )
    session.add(regulator)
    await session.flush()
    return regulator


async def get_regulator(
    session: AsyncSession, tenant_id: uuid.UUID, regulator_id: uuid.UUID
) -> Optional[Regulator]:
    result = await session.execute(
        select(Regulator).where(and_(Regulator.id == regulator_id, Regulator.tenant_id == tenant_id, Regulator.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Report Definitions ──

async def get_report_definitions(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[ReportDefinition]:
    result = await session.execute(
        select(ReportDefinition).where(and_(ReportDefinition.tenant_id == tenant_id, ReportDefinition.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Submissions ──

async def submit_report(
    session: AsyncSession, tenant_id: uuid.UUID, data: SubmissionCreate
) -> Submission:
    submission = Submission(
        tenant_id=tenant_id,
        regulator_id=data.regulator_id,
        report_type=data.report_type,
        payload=data.payload,
        status="submitted",
        submitted_at=datetime.now(timezone.utc),
    )
    session.add(submission)
    await session.flush()
    await publish_event("REPORT_SUBMITTED", tenant_id, submission.id, {"report_type": data.report_type})
    
    # Mocking standard immediate acknowledgment
    ack = Acknowledgment(
        tenant_id=tenant_id,
        submission_id=submission.id,
        ack_status="accepted",
        response={"receipt_id": str(uuid.uuid4())},
    )
    session.add(ack)
    await session.flush()
    await publish_event("ACK_RECEIVED", tenant_id, submission.id, {"status": "accepted"})
    
    return submission


async def get_submission(
    session: AsyncSession, tenant_id: uuid.UUID, submission_id: uuid.UUID
) -> Optional[Submission]:
    result = await session.execute(
        select(Submission).where(and_(Submission.id == submission_id, Submission.tenant_id == tenant_id, Submission.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Acknowledgments ──

async def get_acknowledgments(
    session: AsyncSession, tenant_id: uuid.UUID, submission_id: uuid.UUID
) -> List[Acknowledgment]:
    result = await session.execute(
        select(Acknowledgment).where(and_(Acknowledgment.submission_id == submission_id, Acknowledgment.tenant_id == tenant_id, Acknowledgment.deleted_at.is_(None)))
        .order_by(Acknowledgment.received_at.desc())
    )
    return list(result.scalars().all())
