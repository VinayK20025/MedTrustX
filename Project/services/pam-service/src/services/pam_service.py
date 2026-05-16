"""
MedTrustX PAM Service — Business Logic Layer
"""
import uuid
import secrets
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.pam import PrivilegedAccount, PrivilegeRequest, PrivilegedSession, ApprovalWorkflow, CredentialReference
from src.schemas.pam import (
    AccessRequestCreate, ApprovalAction, SessionStart, AccountCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Requests ──

async def create_request(
    session: AsyncSession, tenant_id: uuid.UUID, data: AccessRequestCreate
) -> PrivilegeRequest:
    req = PrivilegeRequest(
        tenant_id=tenant_id,
        user_id=data.user_id,
        requested_role=data.requested_role,
        reason=data.reason,
        status="pending"
    )
    session.add(req)
    await session.flush()
    return req

async def get_request(
    session: AsyncSession, tenant_id: uuid.UUID, request_id: uuid.UUID
) -> Optional[PrivilegeRequest]:
    result = await session.execute(
        select(PrivilegeRequest).where(and_(PrivilegeRequest.id == request_id, PrivilegeRequest.tenant_id == tenant_id, PrivilegeRequest.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Approvals ──

async def process_approval(
    session: AsyncSession, tenant_id: uuid.UUID, data: ApprovalAction, approve: bool
) -> Optional[PrivilegeRequest]:
    req = await get_request(session, tenant_id, data.request_id)
    if not req or req.status != "pending":
        return None
        
    status = "approved" if approve else "rejected"
    req.status = status
    if approve:
        req.approved_at = datetime.now(timezone.utc)
        
    workflow = ApprovalWorkflow(
        tenant_id=tenant_id,
        request_id=req.id,
        approver_id=data.approver_id,
        status=status,
        acted_at=datetime.now(timezone.utc)
    )
    session.add(workflow)
    await session.flush()
    
    if approve:
        await publish_event("PRIVILEGE_GRANTED", tenant_id, req.id, {"user_id": str(req.user_id), "role": req.requested_role})
        
    return req

# ── Sessions ──

async def start_session(
    session: AsyncSession, tenant_id: uuid.UUID, data: SessionStart
) -> Optional[PrivilegedSession]:
    req = await get_request(session, tenant_id, data.request_id)
    if not req or req.status != "approved":
        return None
        
    token = secrets.token_urlsafe(32)
    sess = PrivilegedSession(
        tenant_id=tenant_id,
        user_id=data.user_id,
        session_token=token,
        status="active"
    )
    session.add(sess)
    await session.flush()
    await publish_event("SESSION_STARTED", tenant_id, sess.id, {"user_id": str(data.user_id)})
    return sess

async def end_session(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID
) -> Optional[PrivilegedSession]:
    result = await session.execute(
        select(PrivilegedSession).where(and_(PrivilegedSession.id == session_id, PrivilegedSession.tenant_id == tenant_id, PrivilegedSession.deleted_at.is_(None)))
    )
    sess = result.scalar_one_or_none()
    
    if sess and sess.status == "active":
        sess.status = "ended"
        sess.ended_at = datetime.now(timezone.utc)
        await session.flush()
        await publish_event("SESSION_TERMINATED", tenant_id, sess.id, {"user_id": str(sess.user_id)})
        return sess
    return None

async def get_session_info(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID
) -> Optional[PrivilegedSession]:
    result = await session.execute(
        select(PrivilegedSession).where(and_(PrivilegedSession.id == session_id, PrivilegedSession.tenant_id == tenant_id, PrivilegedSession.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Accounts ──

async def create_account(
    session: AsyncSession, tenant_id: uuid.UUID, data: AccountCreate
) -> PrivilegedAccount:
    acc = PrivilegedAccount(
        tenant_id=tenant_id,
        account_name=data.account_name,
        system=data.system,
        status="active"
    )
    session.add(acc)
    await session.flush()
    return acc

async def get_accounts(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[PrivilegedAccount]:
    result = await session.execute(
        select(PrivilegedAccount).where(and_(PrivilegedAccount.tenant_id == tenant_id, PrivilegedAccount.deleted_at.is_(None)))
    )
    return list(result.scalars().all())
