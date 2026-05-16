"""
MedTrustX Medical Records Service — Document Metadata Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.records import RecordDocumentCreate, RecordDocumentResponse
from src.services import records_service

router = APIRouter(prefix="/medical-records/{record_id}/documents", tags=["Documents"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

def _get_user_id(request: Request) -> uuid.UUID:
    user_id_str = getattr(request.state, "user_id", None) or request.headers.get("X-User-ID")
    if not user_id_str:
        return uuid.uuid4()
    return uuid.UUID(str(user_id_str))

@router.post(
    "/",
    response_model=RecordDocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Attach document metadata reference to a medical record",
)
async def attach_document(
    record_id: uuid.UUID,
    data: RecordDocumentCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    doc = await records_service.attach_document(session, tenant_id, record_id, user_id, data)
    if not doc:
        raise HTTPException(status_code=404, detail="Medical record not found")
    await session.commit()
    return doc
