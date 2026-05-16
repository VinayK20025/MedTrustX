"""
MedTrustX Compliance Service — Policies Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.compliance import PolicyCreate, PolicyResponse, PolicyUpdate
from src.services import compliance_service

router = APIRouter(prefix="/policies", tags=["Policies"])

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
    response_model=PolicyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new policy",
)
async def create_policy(
    data: PolicyCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    policy = await compliance_service.create_policy(session, tenant_id, data)
    await session.commit()
    return policy

@router.get(
    "/{policy_id}",
    response_model=PolicyResponse,
    summary="Get policy details",
)
async def get_policy(
    policy_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    policy = await compliance_service.get_policy(session, tenant_id, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy

@router.put(
    "/{policy_id}",
    response_model=PolicyResponse,
    summary="Update a policy",
)
async def update_policy(
    policy_id: uuid.UUID,
    data: PolicyUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    policy = await compliance_service.update_policy(session, tenant_id, policy_id, data)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    await session.commit()
    return policy
