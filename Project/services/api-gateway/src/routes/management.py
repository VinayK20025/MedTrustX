"""
MedTrustX Internal API Gateway — Management Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.gateway import (
    GatewayPolicyCreate,
    GatewayPolicyResponse,
    GatewayRateLimitCreate,
    GatewayRateLimitResponse,
    GatewayRouteCreate,
    GatewayRouteResponse,
    GatewayRouteUpdate,
)
from src.services import gateway_service

router = APIRouter(prefix="/gateway", tags=["Gateway Management"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

# ── Routes ──
@router.post(
    "/routes",
    response_model=GatewayRouteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new internal service route",
)
async def create_route(
    data: GatewayRouteCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    route = await gateway_service.create_route(session, tenant_id, data)
    await session.commit()
    return route

@router.get(
    "/routes",
    response_model=List[GatewayRouteResponse],
    summary="List all active routes for the tenant",
)
async def get_routes(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await gateway_service.get_all_routes(session, tenant_id)

@router.put(
    "/routes/{route_id}",
    response_model=GatewayRouteResponse,
    summary="Update a route configuration",
)
async def update_route(
    route_id: uuid.UUID,
    data: GatewayRouteUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    route = await gateway_service.update_route(session, tenant_id, route_id, data)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    await session.commit()
    return route

# ── Policies ──
@router.post(
    "/policies",
    response_model=GatewayPolicyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Zero Trust policy binding",
)
async def create_policy(
    data: GatewayPolicyCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    policy = await gateway_service.create_policy(session, tenant_id, data)
    await session.commit()
    return policy

# ── Rate Limits ──
@router.post(
    "/rate-limits",
    response_model=GatewayRateLimitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Define a new API rate limit",
)
async def create_rate_limit(
    data: GatewayRateLimitCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    limit = await gateway_service.create_rate_limit(session, tenant_id, data)
    await session.commit()
    return limit
