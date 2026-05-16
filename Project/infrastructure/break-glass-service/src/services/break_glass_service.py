"""
MedTrustX Break-Glass — Business Logic Layer (Portable)

Implements the full emergency access lifecycle:
  Request → Policy Evaluation → Approval → Session Activation → Audit → Expiry/Revocation
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.config import settings
from src.models.break_glass import BreakGlassApproval, BreakGlassAudit, BreakGlassRequest, BreakGlassSession
from src.policies.policy_engine import evaluate_auto_approval, get_policy
from src.schemas.break_glass import ApprovalCreate, BreakGlassRequestCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ─────────── REQUEST ───────────

async def create_request(session: AsyncSession, tenant_id: str, data: BreakGlassRequestCreate) -> BreakGlassRequest:
    policy = get_policy(data.policy_name) or get_policy("general_emergency")
    risk_level = _assess_risk_level(data.context)

    request = BreakGlassRequest(
        tenant_id=tenant_id,
        user_id=str(data.user_id),
        justification=data.justification,
        context=data.context,
        risk_level=risk_level,
        policy_name=data.policy_name,
        status="pending",
        mfa_verified=data.mfa_verified,
        device_compliant=data.device_compliant,
    )
    session.add(request)
    await session.flush()

    # Check auto-approval (e.g., clinical emergency with attending doctor)
    user_role = data.context.get("user_role", "anonymous")
    if evaluate_auto_approval(policy, data.context, user_role):
        request.status = "approved"
        approval = BreakGlassApproval(
            tenant_id=tenant_id, request_id=request.id,
            approver_id="00000000-0000-0000-0000-000000000000",
            decision="approved", reason="Auto-approved by policy: " + policy.name,
        )
        session.add(approval)
        await session.flush()
        logger.info("break_glass_auto_approved", request_id=request.id, policy=policy.name)

    return request


# ─────────── APPROVAL ───────────

async def approve_request(session: AsyncSession, tenant_id: str, request_id: str, data: ApprovalCreate) -> BreakGlassApproval:
    result = await session.execute(
        select(BreakGlassRequest).where(and_(BreakGlassRequest.id == request_id, BreakGlassRequest.tenant_id == tenant_id))
    )
    request = result.scalar_one_or_none()
    if not request:
        raise ValueError("Request not found")

    policy = get_policy(request.policy_name) or get_policy("general_emergency")

    approval = BreakGlassApproval(
        tenant_id=tenant_id, request_id=request_id,
        approver_id=str(data.approver_id), decision=data.decision, reason=data.reason,
    )
    session.add(approval)
    await session.flush()

    if data.decision == "approved":
        if policy.require_dual_approval:
            existing = await session.execute(
                select(BreakGlassApproval).where(and_(BreakGlassApproval.request_id == request_id, BreakGlassApproval.decision == "approved"))
            )
            approvals = list(existing.scalars().all())
            request.status = "approved" if len(approvals) >= 2 else "pending_second_approval"
        else:
            request.status = "approved"
    else:
        request.status = "denied"

    await session.flush()
    return approval


# ─────────── SESSION ACTIVATION ───────────

async def activate_session(session: AsyncSession, tenant_id: str, request_id: str) -> BreakGlassSession:
    result = await session.execute(
        select(BreakGlassRequest).where(and_(BreakGlassRequest.id == request_id, BreakGlassRequest.tenant_id == tenant_id))
    )
    request = result.scalar_one_or_none()
    if not request:
        raise ValueError("Request not found")
    if request.status != "approved":
        raise ValueError(f"Request not in approved state: {request.status}")

    policy = get_policy(request.policy_name) or get_policy("general_emergency")
    duration = min(policy.max_duration_minutes, settings.MAX_SESSION_DURATION_MINUTES)

    bg_session = BreakGlassSession(
        tenant_id=tenant_id,
        request_id=request_id,
        user_id=request.user_id,
        scope={"resources": policy.allowed_scopes, "context": request.context, "permissions": _derive_permissions(policy.allowed_scopes)},
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=duration),
        status="active",
    )
    session.add(bg_session)
    request.status = "activated"
    await session.flush()

    audit = BreakGlassAudit(
        tenant_id=tenant_id, session_id=bg_session.id, user_id=request.user_id,
        action="session_activated", resource="break_glass_system",
        audit_metadata={"scope": bg_session.scope, "duration_minutes": duration, "justification": request.justification},
    )
    session.add(audit)
    await session.flush()
    logger.info("break_glass_session_activated", session_id=bg_session.id, duration=duration)
    return bg_session


# ─────────── SESSION QUERY ───────────

async def get_session_by_id(session: AsyncSession, tenant_id: str, session_id: str) -> Optional[BreakGlassSession]:
    result = await session.execute(
        select(BreakGlassSession).where(and_(BreakGlassSession.id == session_id, BreakGlassSession.tenant_id == tenant_id))
    )
    bg_session = result.scalar_one_or_none()
    if bg_session and bg_session.status == "active" and bg_session.expires_at < datetime.now(timezone.utc):
        bg_session.status = "expired"
        await session.flush()
    return bg_session


# ─────────── AUDIT ───────────

async def list_audit(session: AsyncSession, tenant_id: str, session_id: Optional[str] = None) -> List[BreakGlassAudit]:
    stmt = select(BreakGlassAudit).where(BreakGlassAudit.tenant_id == tenant_id)
    if session_id:
        stmt = stmt.where(BreakGlassAudit.session_id == session_id)
    stmt = stmt.order_by(BreakGlassAudit.created_at.desc()).limit(200)
    result = await session.execute(stmt)
    return list(result.scalars().all())


# ─────────── HELPERS ───────────

def _assess_risk_level(context: dict) -> str:
    emergency_type = context.get("emergency_type", "")
    if emergency_type in ("cardiac_arrest", "life_critical", "code_blue"):
        return "critical"
    threat = context.get("threat_level", "")
    if threat in ("active", "critical"):
        return "critical"
    severity = context.get("severity", "")
    if severity == "critical":
        return "high"
    return "high"

def _derive_permissions(scopes: list) -> list:
    perms = set()
    for scope in scopes:
        if "read" in scope or "ehr" in scope:
            perms.add("read")
        if "write" in scope or "critical_write" in scope:
            perms.add("critical_write")
        if "execute" in scope or "control" in scope:
            perms.add("execute")
        if "export" in scope:
            perms.add("export_watermarked")
        if "admin" in scope:
            perms.add("admin_limited")
    if not perms:
        perms.add("read")
    return sorted(perms)
