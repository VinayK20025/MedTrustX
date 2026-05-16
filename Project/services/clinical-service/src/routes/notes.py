"""
MedTrustX Clinical Service — Clinical Notes Routes
"""
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.clinical import ClinicalNoteCreate, ClinicalNoteResponse
from src.services import clinical_service

router = APIRouter(prefix="/encounters/{encounter_id}/notes", tags=["Clinical Notes"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


def _get_user_id(request: Request) -> uuid.UUID:
    # Extracted from JWT by auth middleware in API Gateway, passed as header or state
    user_id_str = getattr(request.state, "user_id", None) or request.headers.get("X-User-ID")
    if not user_id_str:
        # Fallback for dev if not provided
        return uuid.uuid4()
    return uuid.UUID(str(user_id_str))


@router.post(
    "/",
    response_model=ClinicalNoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add clinical note (SOAP)",
)
async def add_note(
    encounter_id: uuid.UUID,
    data: ClinicalNoteCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    user_id = _get_user_id(request)
    
    note = await clinical_service.add_clinical_note(
        session, tenant_id, encounter_id, user_id, data
    )
    if not note:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    await session.commit()
    return note


@router.get(
    "/",
    response_model=List[ClinicalNoteResponse],
    summary="List clinical notes",
)
async def list_notes(
    encounter_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    return await clinical_service.list_notes(session, tenant_id, encounter_id)
