"""
MedTrustX OPA Shim Service — Business Logic Layer
"""
import uuid
from typing import Optional, Dict, Any, List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.opa import OPAPolicy, OPAData, OPADecision
from src.schemas.opa import PolicyPutRequest, DataPutRequest, EvalRequest, EvalResponse
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Data Management ──

async def put_data(
    session: AsyncSession, tenant_id: uuid.UUID, package: str, data: DataPutRequest
) -> OPAData:
    result = await session.execute(
        select(OPAData).where(and_(OPAData.package_name == package, OPAData.tenant_id == tenant_id, OPAData.deleted_at.is_(None)))
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.json_data = data.data
        d = existing
    else:
        d = OPAData(tenant_id=tenant_id, package_name=package, json_data=data.data)
        session.add(d)
        
    await session.flush()
    return d

# ── Policy Management ──

async def put_policy(
    session: AsyncSession, tenant_id: uuid.UUID, package: str, data: PolicyPutRequest
) -> OPAPolicy:
    result = await session.execute(
        select(OPAPolicy).where(and_(OPAPolicy.package_name == package, OPAPolicy.tenant_id == tenant_id, OPAPolicy.deleted_at.is_(None)))
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.rego_code = data.rego
        p = existing
    else:
        p = OPAPolicy(tenant_id=tenant_id, package_name=package, rego_code=data.rego)
        session.add(p)
        
    await session.flush()
    await publish_event("POLICY_UPDATED", tenant_id, p.id, {"package": package})
    return p

async def get_policies(
    session: AsyncSession, tenant_id: uuid.UUID
) -> List[OPAPolicy]:
    result = await session.execute(
        select(OPAPolicy).where(and_(OPAPolicy.tenant_id == tenant_id, OPAPolicy.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

async def delete_policy(
    session: AsyncSession, tenant_id: uuid.UUID, package: str
) -> bool:
    result = await session.execute(
        select(OPAPolicy).where(and_(OPAPolicy.package_name == package, OPAPolicy.tenant_id == tenant_id, OPAPolicy.deleted_at.is_(None)))
    )
    p = result.scalar_one_or_none()
    if p:
        p.soft_delete()
        await session.flush()
        return True
    return False

# ── Evaluation ──

async def evaluate_policy(
    session: AsyncSession, tenant_id: uuid.UUID, package: str, request: EvalRequest
) -> EvalResponse:
    # In a real OPA shim, we would compile and evaluate the Rego here using something like `pyrego`
    # For architectural representation, we mock the decision logic.
    
    result_dict = {"allow": True, "reason": "default_allow"}
    
    input_data = request.input
    if "emergency" in input_data and input_data["emergency"] is True:
        result_dict = {"allow": True, "reason": "emergency_override"}
    elif "role" in input_data and input_data["role"] == "anonymous":
        result_dict = {"allow": False, "reason": "unauthenticated"}
    elif "device_trust_score" in input_data and float(input_data["device_trust_score"]) < 0.5:
        result_dict = {"allow": False, "reason": "device_untrusted", "action": "mfa"}
        
    # Log the decision
    decision = OPADecision(
        tenant_id=tenant_id,
        package_name=package,
        input_data=input_data,
        result_data=result_dict
    )
    session.add(decision)
    await session.flush()
    
    if not result_dict["allow"]:
        await publish_event("POLICY_DENIED", tenant_id, decision.id, {"package": package, "reason": result_dict["reason"]})
    else:
        # Avoid spamming ALLOW events, or sample them. 
        pass
        
    return EvalResponse(result=result_dict)
