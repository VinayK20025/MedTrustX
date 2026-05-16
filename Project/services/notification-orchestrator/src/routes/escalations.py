"""
MedTrustX Notification Orchestrator Service — Escalations Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.orchestrator import EscalationRuleCreate, EscalationRuleResponse
from src.services import orchestrator_service

router = APIRouter(prefix="/escalation-rules", tags=["Escalation Rules"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/",
    response_model=EscalationRuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new escalation rule",
)
async def create_escalation_rule(
    data: EscalationRuleCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    rule = await orchestrator_service.create_escalation_rule(session, tenant_id, data)
    await session.commit()
    return rule

@router.get(
    "/{rule_id}",
    response_model=EscalationRuleResponse,
    summary="Get escalation rule details",
)
async def get_escalation_rule(
    rule_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    rule = await orchestrator_service.get_escalation_rule(session, tenant_id, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rule
