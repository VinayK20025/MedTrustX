"""
MedTrustX Access Control Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.access import AccessRequest, AccessDecision, PolicyBinding, AttributeStore, AccessLog
from src.schemas.access import (
    AccessEvaluateRequest, PolicyBindingCreate, AttributeCreate
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Evaluate ──

async def evaluate_access(
    session: AsyncSession, tenant_id: uuid.UUID, data: AccessEvaluateRequest
) -> AccessDecision:
    # 1. Log the request
    req = AccessRequest(
        tenant_id=tenant_id,
        user_id=data.user_id,
        resource=data.resource,
        action=data.action,
        context=data.context
    )
    session.add(req)
    await session.flush()
    
    # 2. Evaluate access (simulated logic, would normally call OPA with policies/attributes)
    decision_val = "allow"
    reason_val = "policy_matched"
    
    # Simulate a conditional check
    if data.context and data.context.get("risk_score", 0) > 80:
        decision_val = "deny"
        reason_val = "high_risk_score"
    elif data.context and data.context.get("trust_level") == "low":
        decision_val = "conditional"
        reason_val = "mfa_required"
        
    decision = AccessDecision(
        request_id=req.id,
        tenant_id=tenant_id,
        decision=decision_val,
        reason=reason_val
    )
    session.add(decision)
    
    # 3. Create Audit Log
    log = AccessLog(
        tenant_id=tenant_id,
        user_id=data.user_id,
        resource=data.resource,
        action=data.action,
        decision=decision_val
    )
    session.add(log)
    
    await session.flush()
    
    event_type = "ACCESS_GRANTED" if decision_val == "allow" else ("ACCESS_DENIED" if decision_val == "deny" else "POLICY_VIOLATION")
    await publish_event(event_type, tenant_id, decision.id, {
        "user_id": str(data.user_id),
        "resource": data.resource,
        "action": data.action,
        "reason": reason_val
    })
    
    return decision

async def get_access_decision(
    session: AsyncSession, tenant_id: uuid.UUID, decision_id: uuid.UUID
) -> Optional[AccessDecision]:
    result = await session.execute(
        select(AccessDecision).where(and_(AccessDecision.id == decision_id, AccessDecision.tenant_id == tenant_id, AccessDecision.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Policy Bindings ──

async def create_policy_binding(
    session: AsyncSession, tenant_id: uuid.UUID, data: PolicyBindingCreate
) -> PolicyBinding:
    binding = PolicyBinding(
        tenant_id=tenant_id,
        role_id=data.role_id,
        policy_name=data.policy_name
    )
    session.add(binding)
    await session.flush()
    return binding

async def get_policy_binding(
    session: AsyncSession, tenant_id: uuid.UUID, binding_id: uuid.UUID
) -> Optional[PolicyBinding]:
    result = await session.execute(
        select(PolicyBinding).where(and_(PolicyBinding.id == binding_id, PolicyBinding.tenant_id == tenant_id, PolicyBinding.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Attributes ──

async def create_attribute(
    session: AsyncSession, tenant_id: uuid.UUID, data: AttributeCreate
) -> AttributeStore:
    # Check if exists
    result = await session.execute(
        select(AttributeStore).where(and_(
            AttributeStore.attribute_key == data.attribute_key,
            AttributeStore.tenant_id == tenant_id,
            AttributeStore.deleted_at.is_(None)
        ))
    )
    attr = result.scalar_one_or_none()
    
    if attr:
        attr.attribute_value = data.attribute_value
        attr.updated_at = datetime.now(timezone.utc)
    else:
        attr = AttributeStore(
            tenant_id=tenant_id,
            attribute_key=data.attribute_key,
            attribute_value=data.attribute_value
        )
        session.add(attr)
        
    await session.flush()
    return attr

async def get_attribute(
    session: AsyncSession, tenant_id: uuid.UUID, key: str
) -> Optional[AttributeStore]:
    result = await session.execute(
        select(AttributeStore).where(and_(
            AttributeStore.attribute_key == key,
            AttributeStore.tenant_id == tenant_id,
            AttributeStore.deleted_at.is_(None)
        ))
    )
    return result.scalar_one_or_none()

# ── Logs ──

async def get_access_logs(
    session: AsyncSession, tenant_id: uuid.UUID, limit: int = 100
) -> List[AccessLog]:
    result = await session.execute(
        select(AccessLog)
        .where(and_(AccessLog.tenant_id == tenant_id, AccessLog.deleted_at.is_(None)))
        .order_by(AccessLog.timestamp.desc())
        .limit(limit)
    )
    return list(result.scalars().all())
