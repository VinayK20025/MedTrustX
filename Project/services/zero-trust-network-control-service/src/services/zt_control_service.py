"""
MedTrustX Zero Trust Network Control Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.zt_network import AccessDecision, AccessPolicy, NetworkSession
from src.schemas.zt_network import AccessEvaluate, PolicyCreate, SessionCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Policies ──

async def create_policy(session: AsyncSession, tenant_id: uuid.UUID, data: PolicyCreate) -> AccessPolicy:
    pol = AccessPolicy(tenant_id=tenant_id, policy_name=data.policy_name, rules=data.rules)
    session.add(pol)
    await session.flush()
    return pol


# ── Sessions ──

async def create_session(session: AsyncSession, tenant_id: uuid.UUID, data: SessionCreate) -> NetworkSession:
    sess = NetworkSession(tenant_id=tenant_id, user_id=data.user_id, device_id=data.device_id)
    session.add(sess)
    await session.flush()
    return sess


async def get_session(session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID) -> NetworkSession | None:
    result = await session.execute(
        select(NetworkSession).where(
            and_(NetworkSession.id == session_id, NetworkSession.tenant_id == tenant_id, NetworkSession.deleted_at.is_(None))
        )
    )
    return result.scalar_one_or_none()


# ── Access Evaluation ──

async def evaluate_access(session: AsyncSession, tenant_id: uuid.UUID, data: AccessEvaluate) -> AccessDecision:
    # Extremely simplified local mock evaluation
    decision = "allow"
    reason = "policy_match"
    if data.resource.endswith("_denied"):
        decision = "deny"
        reason = "explicit_deny_rule"

    dec = AccessDecision(tenant_id=tenant_id, session_id=data.session_id, decision=decision, reason=reason)
    session.add(dec)
    await session.flush()

    event_type = "ACCESS_GRANTED" if decision == "allow" else "ACCESS_DENIED"
    await publish_event(event_type, tenant_id, data.session_id, {"resource": data.resource, "reason": reason})
    return dec


async def list_decisions(session: AsyncSession, tenant_id: uuid.UUID) -> List[AccessDecision]:
    result = await session.execute(
        select(AccessDecision).where(
            and_(AccessDecision.tenant_id == tenant_id, AccessDecision.deleted_at.is_(None))
        ).order_by(AccessDecision.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
