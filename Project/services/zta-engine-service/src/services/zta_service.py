"""
MedTrustX ZTA Engine Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.zta import TrustSession, ContextAttribute, RiskEvent, AccessDecision, DeviceProfile
from src.schemas.zta import (
    AccessEvaluationRequest, ContextUpdateRequest, RiskEventCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Evaluate Access ──

async def evaluate_access(
    session: AsyncSession, tenant_id: uuid.UUID, data: AccessEvaluationRequest
) -> AccessDecision:
    # 1. Fetch current risk score and session trust level
    result = await session.execute(
        select(TrustSession).where(and_(TrustSession.user_id == data.user_id, TrustSession.tenant_id == tenant_id, TrustSession.deleted_at.is_(None)))
    )
    trust_session = result.scalar_one_or_none()
    
    risk_score = trust_session.risk_score if trust_session else 0
    trust_level = trust_session.trust_level if trust_session else "unknown"
    
    # 2. Evaluate context (IP, device, time) - simplified mock
    decision_str = "allow"
    reason_str = "context_verified"
    
    if risk_score > 80:
        decision_str = "deny"
        reason_str = "high_risk_score"
    elif "location" in data.context and data.context["location"] == "untrusted_region":
        decision_str = "deny"
        reason_str = "untrusted_location"
    elif trust_level == "low":
        decision_str = "mfa_required"
        reason_str = "low_trust_level"
        
    decision = AccessDecision(
        tenant_id=tenant_id,
        user_id=data.user_id,
        resource=data.resource,
        decision=decision_str,
        reason=reason_str,
    )
    session.add(decision)
    await session.flush()
    
    event_type = "ACCESS_GRANTED" if decision_str == "allow" else "ACCESS_DENIED"
    await publish_event(event_type, tenant_id, decision.id, {
        "user_id": str(data.user_id),
        "resource": data.resource,
        "risk_score": risk_score,
        "reason": reason_str,
    })
    
    return decision

async def get_access_decision(
    session: AsyncSession, tenant_id: uuid.UUID, decision_id: uuid.UUID
) -> Optional[AccessDecision]:
    result = await session.execute(
        select(AccessDecision).where(and_(AccessDecision.id == decision_id, AccessDecision.tenant_id == tenant_id, AccessDecision.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Update Context ──

async def update_context(
    session: AsyncSession, tenant_id: uuid.UUID, data: ContextUpdateRequest
) -> List[ContextAttribute]:
    attrs = []
    for key, value in data.attributes.items():
        attr = ContextAttribute(
            tenant_id=tenant_id,
            session_id=data.session_id,
            attribute_key=key,
            attribute_value=value,
        )
        session.add(attr)
        attrs.append(attr)
    
    await session.flush()
    return attrs

# ── Sessions ──

async def get_session_by_id(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID
) -> Optional[TrustSession]:
    result = await session.execute(
        select(TrustSession).where(and_(TrustSession.id == session_id, TrustSession.tenant_id == tenant_id, TrustSession.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Risk Events ──

async def create_risk_event(
    session: AsyncSession, tenant_id: uuid.UUID, data: RiskEventCreate
) -> RiskEvent:
    # 1. Create event
    event = RiskEvent(
        tenant_id=tenant_id,
        user_id=data.user_id,
        event_type=data.event_type,
        risk_score=data.risk_score,
    )
    session.add(event)
    
    # 2. Update trust session risk score
    ts_result = await session.execute(
        select(TrustSession).where(and_(TrustSession.user_id == data.user_id, TrustSession.tenant_id == tenant_id, TrustSession.deleted_at.is_(None)))
    )
    trust_session = ts_result.scalar_one_or_none()
    
    if trust_session:
        # Simple additive model capped at 100
        trust_session.risk_score = min(100, trust_session.risk_score + data.risk_score)
        
        # Adjust trust level based on score
        if trust_session.risk_score > 80:
            trust_session.trust_level = "low"
        elif trust_session.risk_score > 50:
            trust_session.trust_level = "medium"
            
        trust_session.updated_at = datetime.now(timezone.utc)
    else:
        # Create initial trust session if it doesn't exist
        trust_level = "high"
        if data.risk_score > 80: trust_level = "low"
        elif data.risk_score > 50: trust_level = "medium"
            
        trust_session = TrustSession(
            tenant_id=tenant_id,
            user_id=data.user_id,
            risk_score=min(100, data.risk_score),
            trust_level=trust_level
        )
        session.add(trust_session)
        
    await session.flush()
    
    await publish_event("RISK_SCORE_UPDATED", tenant_id, event.id, {
        "user_id": str(data.user_id),
        "new_risk_score": trust_session.risk_score,
        "trust_level": trust_session.trust_level,
    })
    
    if trust_session.risk_score >= 100:
        await publish_event("SESSION_REVOKED", tenant_id, trust_session.id, {
            "user_id": str(data.user_id),
            "reason": "max_risk_score_reached"
        })
    
    return event
