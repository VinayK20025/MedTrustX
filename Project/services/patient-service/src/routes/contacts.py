"""
MedTrustX Patient Service — Contact Routes

Manage patient emergency contacts and next-of-kin.

Endpoints:
  GET    /api/v1/patients/{id}/contacts               → List contacts
  POST   /api/v1/patients/{id}/contacts               → Add contact
  PUT    /api/v1/patients/{id}/contacts/{contact_id}  → Update contact
  DELETE /api/v1/patients/{id}/contacts/{contact_id}  → Remove contact
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from src.database import get_session
from src.schemas.patient import ContactCreate, ContactResponse, ContactUpdate
from src.services import patient_service

router = APIRouter(
    prefix="/patients/{patient_id}/contacts",
    tags=["Patient Contacts"],
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
    response_model=List[ContactResponse],
    summary="List patient contacts",
    description="Returns all emergency contacts and next-of-kin for a patient.",
)
async def list_contacts(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    patient = await patient_service.get_patient_by_id(session, tenant_id, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    contacts = await patient_service.list_contacts(session, tenant_id, patient_id)
    return contacts


@router.post(
    "/",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add emergency contact",
    description="Add a new emergency contact or next-of-kin. "
    "Setting is_primary=true will unset any existing primary contact.",
)
async def add_contact(
    patient_id: uuid.UUID,
    data: ContactCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    contact = await patient_service.add_contact(
        session, tenant_id, patient_id, data
    )
    if contact is None:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    await session.commit()
    return contact


@router.put(
    "/{contact_id}",
    response_model=ContactResponse,
    summary="Update a contact",
    description="Partial update of contact details. "
    "Setting is_primary=true will unset any other primary contact.",
)
async def update_contact(
    patient_id: uuid.UUID,
    contact_id: uuid.UUID,
    data: ContactUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    contact = await patient_service.update_contact(
        session, tenant_id, patient_id, contact_id, data
    )
    if contact is None:
        raise HTTPException(
            status_code=404,
            detail=f"Contact {contact_id} not found for patient {patient_id}",
        )

    await session.commit()
    return contact


@router.delete(
    "/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove a contact",
    description="Soft-deletes an emergency contact.",
)
async def delete_contact(
    patient_id: uuid.UUID,
    contact_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    deleted = await patient_service.delete_contact(
        session, tenant_id, patient_id, contact_id
    )
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Contact {contact_id} not found for patient {patient_id}",
        )

    await session.commit()
