"""
MedTrustX Patient Service — Identifier Routes

Manage secondary patient identifiers (UHID, Aadhaar hash, passport, insurance IDs).

Endpoints:
  GET    /api/v1/patients/{id}/identifiers             → List identifiers
  POST   /api/v1/patients/{id}/identifiers             → Add identifier
  DELETE /api/v1/patients/{id}/identifiers/{ident_id}  → Remove identifier
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.database import get_session
from src.schemas.patient import IdentifierCreate, IdentifierResponse
from src.services import patient_service

router = APIRouter(
    prefix="/patients/{patient_id}/identifiers",
    tags=["Patient Identifiers"],
)


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
    response_model=List[IdentifierResponse],
    summary="List patient identifiers",
    description="Returns all secondary identifiers (UHID, Aadhaar, etc.) for a patient.",
)
async def list_identifiers(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    # Verify patient exists
    patient = await patient_service.get_patient_by_id(session, tenant_id, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    identifiers = await patient_service.list_identifiers(session, tenant_id, patient_id)
    return identifiers


@router.post(
    "/",
    response_model=IdentifierResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a secondary identifier",
    description="Assign a new identifier (UHID, Aadhaar hash, passport, insurance) "
    "to a patient. Type + value must be unique within the tenant.",
)
async def add_identifier(
    patient_id: uuid.UUID,
    data: IdentifierCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    identifier = await patient_service.add_identifier(
        session, tenant_id, patient_id, data
    )
    if identifier is None:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    try:
        await session.commit()
        return identifier
    except Exception as exc:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Identifier {data.type}={data.value} already exists in this tenant",
        )


@router.delete(
    "/{identifier_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove an identifier",
    description="Soft-deletes a patient identifier.",
)
async def delete_identifier(
    patient_id: uuid.UUID,
    identifier_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    deleted = await patient_service.delete_identifier(
        session, tenant_id, patient_id, identifier_id
    )
    if not deleted:
        raise HTTPException(
            status_code=404, detail=f"Identifier {identifier_id} not found"
        )

    await session.commit()
