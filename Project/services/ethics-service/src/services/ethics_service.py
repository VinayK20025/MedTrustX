"""
MedTrustX Ethics Service — Business Logic Layer

Cases, Reviews, Committee, Conflicts, and Policies management.
"""
import uuid
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.ethics import (
    CommitteeMember,
    ConflictDeclaration,
    EthicsCase,
    EthicsPolicy,
    EthicsReview,
)
from src.schemas.ethics import (
    CommitteeMemberCreate,
    ConflictDeclarationCreate,
    EthicsCaseCreate,
    EthicsPolicyCreate,
    EthicsReviewCreate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Cases ──

async def create_case(
    session: AsyncSession, tenant_id: uuid.UUID, data: EthicsCaseCreate
) -> EthicsCase:
    case = EthicsCase(
        tenant_id=tenant_id,
        case_type=data.case_type,
        description=data.description,
        status="submitted",
        submitter_id=data.submitter_id,
    )
    session.add(case)
    await session.flush()
    return case


async def get_case(
    session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID
) -> Optional[EthicsCase]:
    result = await session.execute(
        select(EthicsCase).where(and_(EthicsCase.id == case_id, EthicsCase.tenant_id == tenant_id, EthicsCase.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


# ── Reviews ──

async def submit_review(
    session: AsyncSession, tenant_id: uuid.UUID, case_id: uuid.UUID, data: EthicsReviewCreate
) -> EthicsReview:
    case = await get_case(session, tenant_id, case_id)
    if not case:
        raise ValueError("Case not found")

    review = EthicsReview(
        tenant_id=tenant_id,
        case_id=case_id,
        reviewer_id=data.reviewer_id,
        decision=data.decision,
        comments=data.comments,
    )
    session.add(review)
    
    # Auto-resolve case if approved or rejected
    if data.decision in ("approve", "reject"):
        case.status = "approved" if data.decision == "approve" else "rejected"
        event_name = "ETHICS_APPROVED" if data.decision == "approve" else "ETHICS_REJECTED"
        await publish_event(event_name, tenant_id, case.id, {"type": case.case_type})

    await session.flush()
    return review


# ── Committee ──

async def add_committee_member(
    session: AsyncSession, tenant_id: uuid.UUID, data: CommitteeMemberCreate
) -> CommitteeMember:
    member = CommitteeMember(
        tenant_id=tenant_id,
        user_id=data.user_id,
        role=data.role,
    )
    session.add(member)
    await session.flush()
    return member


async def get_committee(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[CommitteeMember]:
    result = await session.execute(
        select(CommitteeMember).where(and_(CommitteeMember.tenant_id == tenant_id, CommitteeMember.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Conflicts ──

async def declare_conflict(
    session: AsyncSession, tenant_id: uuid.UUID, data: ConflictDeclarationCreate
) -> ConflictDeclaration:
    conflict = ConflictDeclaration(
        tenant_id=tenant_id,
        user_id=data.user_id,
        case_id=data.case_id,
        declaration=data.declaration,
    )
    session.add(conflict)
    await session.flush()
    await publish_event("CONFLICT_DECLARED", tenant_id, conflict.id, {"user_id": str(data.user_id)})
    return conflict


# ── Policies ──

async def create_policy(
    session: AsyncSession, tenant_id: uuid.UUID, data: EthicsPolicyCreate
) -> EthicsPolicy:
    policy = EthicsPolicy(
        tenant_id=tenant_id,
        policy_name=data.policy_name,
        rules=data.rules,
    )
    session.add(policy)
    await session.flush()
    return policy


async def get_policies(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[EthicsPolicy]:
    result = await session.execute(
        select(EthicsPolicy).where(and_(EthicsPolicy.tenant_id == tenant_id, EthicsPolicy.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
