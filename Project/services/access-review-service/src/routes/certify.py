"""
MedTrustX Access Review Service — Certify Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.review import CertificationCreate, CertificationResponse
from src.services import review_service

router = APIRouter(prefix="/reviews", tags=["Certify"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/certify",
    response_model=CertificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Certify or revoke a review item",
)
async def certify_access(
    data: CertificationCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    cert = await review_service.certify_access(session, tenant_id, data)
    if not cert:
        raise HTTPException(status_code=404, detail="Review item not found")
    await session.commit()
    return cert
