"""
MedTrustX Wazuh Shim Service — API Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.wazuh import AlertResponse, RuleCreateRequest, RuleResponse, LogIngestRequest
from src.services import wazuh_service

router = APIRouter(tags=["SIEM"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

# ── Alerts ──
@router.get(
    "/alerts",
    response_model=List[AlertResponse],
    summary="List Alerts",
)
async def list_alerts(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await wazuh_service.get_alerts(session, tenant_id)

@router.get(
    "/alerts/{alert_id}",
    response_model=AlertResponse,
    summary="Get Alert Details",
)
async def get_alert(
    alert_id: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    alert = await wazuh_service.get_alert(session, tenant_id, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

# ── Rules ──
@router.post(
    "/rules",
    response_model=RuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Detection Rule",
)
async def create_rule(
    data: RuleCreateRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    rule = await wazuh_service.create_rule(session, tenant_id, data)
    await session.commit()
    return rule

@router.get(
    "/rules",
    response_model=List[RuleResponse],
    summary="List Rules",
)
async def list_rules(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await wazuh_service.get_rules(session, tenant_id)

# ── Events ──
@router.post(
    "/security-events",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Ingest Security Event",
)
async def ingest_event(
    data: LogIngestRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    await wazuh_service.ingest_event(session, tenant_id, data)
    await session.commit()
    return {"status": "accepted"}

@router.get(
    "/security-events",
    summary="List Security Events",
)
async def list_events(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    events = await wazuh_service.get_events(session, tenant_id)
    return [
        {
            "id": str(e.id),
            "service": e.service_name,
            "type": e.event_type,
            "timestamp": e.created_at.isoformat()
        } for e in events
    ]

# ── Agents (Mock) ──
@router.get(
    "/agents",
    summary="List Connected Agents",
)
async def list_agents():
    # Shim response
    return [
        {"id": "001", "name": "access-control-service", "status": "active", "version": "v4.7.2"},
        {"id": "002", "name": "vault-service", "status": "active", "version": "v4.7.2"}
    ]
