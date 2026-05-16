"""
MedTrustX CDSS Service — Rules Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.cdss import CDSSRuleCreate, CDSSRuleResponse, CDSSRuleUpdate
from src.services import cdss_service

router = APIRouter(prefix="/cdss/rules", tags=["Rules"])

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
    response_model=CDSSRuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new clinical heuristic or evaluation rule",
)
async def create_rule(
    data: CDSSRuleCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    rule = await cdss_service.create_rule(session, tenant_id, data)
    await session.commit()
    return rule

@router.get(
    "/",
    response_model=List[CDSSRuleResponse],
    summary="List all active clinical rules",
)
async def get_active_rules(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await cdss_service.get_active_rules(session, tenant_id)

@router.get(
    "/{rule_id}",
    response_model=CDSSRuleResponse,
    summary="Get details of a specific clinical rule",
)
async def get_rule(
    rule_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    rule = await cdss_service.get_rule(session, tenant_id, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rule

@router.put(
    "/{rule_id}",
    response_model=CDSSRuleResponse,
    summary="Update a clinical rule",
)
async def update_rule(
    rule_id: uuid.UUID,
    data: CDSSRuleUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    rule = await cdss_service.update_rule(session, tenant_id, rule_id, data)
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    await session.commit()
    return rule
