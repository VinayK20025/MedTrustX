"""
MedTrustX Compliance Service — Legal Documents Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.compliance import LegalDocumentCreate, LegalDocumentResponse
from src.services import compliance_service

router = APIRouter(prefix="/legal-documents", tags=["Legal Documents"])

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
    response_model=LegalDocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a legal document",
)
async def create_legal_document(
    data: LegalDocumentCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    doc = await compliance_service.create_document(session, tenant_id, data)
    await session.commit()
    return doc

@router.get(
    "/{document_id}",
    response_model=LegalDocumentResponse,
    summary="Get legal document details",
)
async def get_legal_document(
    document_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    doc = await compliance_service.get_document(session, tenant_id, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Legal document not found")
    return doc
