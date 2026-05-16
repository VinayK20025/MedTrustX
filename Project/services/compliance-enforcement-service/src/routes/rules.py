"""
MedTrustX Compliance Enforcement Service — Rules Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.enforcement import ComplianceRuleCreate, ComplianceRuleResponse, ComplianceRuleUpdate
from src.services import enforcement_service

router = APIRouter(prefix="/compliance/rules", tags=["Compliance Rules"])

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
    response_model=ComplianceRuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a compliance rule",
)
async def create_compliance_rule(
    data: ComplianceRuleCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    rule = await enforcement_service.create_rule(session, tenant_id, data)
    await session.commit()
    return rule

@router.get(
    "/{rule_id}",
    response_model=ComplianceRuleResponse,
    summary="Get rule details",
)
async def get_compliance_rule(
    rule_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    rule = await enforcement_service.get_rule(session, tenant_id, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Compliance rule not found")
    return rule

@router.put(
    "/{rule_id}",
    response_model=ComplianceRuleResponse,
    summary="Update a rule",
)
async def update_compliance_rule(
    rule_id: uuid.UUID,
    data: ComplianceRuleUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    rule = await enforcement_service.update_rule(session, tenant_id, rule_id, data)
    if not rule:
        raise HTTPException(status_code=404, detail="Compliance rule not found")
    await session.commit()
    return rule
