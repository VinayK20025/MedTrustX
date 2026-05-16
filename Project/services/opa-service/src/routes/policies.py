"""
MedTrustX OPA Shim Service — Policy Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.opa import PolicyPutRequest, PolicyResponse
from src.services import opa_service

router = APIRouter(prefix="/v1/policies", tags=["Policies"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.get(
    "/",
    response_model=List[PolicyResponse],
    summary="List all policies",
)
async def list_policies(
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await opa_service.get_policies(session, tenant_id)

@router.put(
    "/{package}",
    response_model=PolicyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create or update a policy",
)
async def put_policy(
    package: str,
    data: PolicyPutRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    p = await opa_service.put_policy(session, tenant_id, package, data)
    await session.commit()
    return p

@router.delete(
    "/{package}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a policy",
)
async def delete_policy(
    package: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    success = await opa_service.delete_policy(session, tenant_id, package)
    if not success:
        raise HTTPException(status_code=404, detail="Policy not found")
    await session.commit()
    return None
