"""
MedTrustX OPA Shim Service — Data & Eval Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.opa import DataPutRequest, EvalRequest, EvalResponse
from src.services import opa_service

router = APIRouter(prefix="/v1/data", tags=["Data"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/{package}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Update Data document",
)
async def update_data(
    package: str,
    data: DataPutRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    await opa_service.put_data(session, tenant_id, package, data)
    await session.commit()
    return None

@router.post(
    "/{package}/decision", # Adjusted from {package}/allow to be dynamic based on rule in actual OPA
    response_model=EvalResponse,
    summary="Evaluate a policy",
)
async def evaluate_policy(
    package: str,
    data: EvalRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    result = await opa_service.evaluate_policy(session, tenant_id, package, data)
    await session.commit()
    return result
