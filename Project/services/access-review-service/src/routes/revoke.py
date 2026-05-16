"""
MedTrustX Access Review Service — Revoke Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.review import RevocationCreate, RevocationResponse
from src.services import review_service

router = APIRouter(prefix="/reviews", tags=["Revoke"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/revoke",
    response_model=RevocationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Directly revoke user access",
)
async def revoke_access(
    data: RevocationCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    rev = await review_service.create_revocation(session, tenant_id, data)
    await session.commit()
    return rev
