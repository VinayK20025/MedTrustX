"""
MedTrustX Access Control Service — Policy Bindings Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.access import PolicyBindingCreate, PolicyBindingResponse
from src.services import access_service

router = APIRouter(prefix="/policy-bindings", tags=["Policy Bindings"])

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
    response_model=PolicyBindingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a policy binding",
)
async def create_binding(
    data: PolicyBindingCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    binding = await access_service.create_policy_binding(session, tenant_id, data)
    await session.commit()
    return binding

@router.get(
    "/{binding_id}",
    response_model=PolicyBindingResponse,
    summary="Get a policy binding",
)
async def get_binding(
    binding_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    binding = await access_service.get_policy_binding(session, tenant_id, binding_id)
    if not binding:
        raise HTTPException(status_code=404, detail="Binding not found")
    return binding
