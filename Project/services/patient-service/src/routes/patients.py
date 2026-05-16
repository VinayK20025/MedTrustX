"""
MedTrustX Patient Service — Patient API Routes

Core Operations:
  POST   /api/v1/patients              → Register patient
  GET    /api/v1/patients              → Search/list patients
  GET    /api/v1/patients/{id}         → Get patient by ID
  GET    /api/v1/patients/{id}/summary → Lightweight summary
  PUT    /api/v1/patients/{id}         → Update demographics
  DELETE /api/v1/patients/{id}         → Soft-delete
  POST   /api/v1/patients/{id}/link-mpi → Link to MPI
"""
import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.patient import (
    MPILinkRequest,
    MPILinkResponse,
    PatientCreate,
    PatientListResponse,
    PatientResponse,
    PatientSummary,
    PatientUpdate,
)
from src.services import patient_service

router = APIRouter(prefix="/patients", tags=["Patients"])


def _get_tenant_id(request: Request) -> uuid.UUID:
    """
    Extract tenant_id from request state (set by TenantMiddleware).
    Converts string to UUID — if the middleware provided a non-UUID
    tenant ID, we generate a deterministic UUID from it.
    """
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing tenant context",
        )
    # Support both UUID strings and slug-style tenant IDs
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        # Deterministic UUID from slug (e.g., "tenant_apollo")
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))


# ────────────────────────────────────────────────────────────────
#  CREATE
# ────────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new patient",
    description="Creates a new patient identity with auto-generated MRN. "
    "Publishes PATIENT_CREATED event to downstream services.",
)
async def create_patient(
    data: PatientCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    try:
        patient = await patient_service.create_patient(session, tenant_id, data)
        await session.commit()
        # Refresh to load relationships
        await session.refresh(patient, ["identifiers", "contacts"])
        return patient
    except Exception as exc:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to create patient: {str(exc)}",
        )


# ────────────────────────────────────────────────────────────────
#  READ
# ────────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=PatientListResponse,
    summary="Search and list patients",
    description="Search patients by name, DOB, phone, MRN, or status. "
    "Returns paginated results scoped to the current tenant.",
)
async def list_patients(
    request: Request,
    name: Optional[str] = Query(None, description="Partial name match"),
    dob: Optional[date] = Query(None, description="Exact DOB"),
    phone: Optional[str] = Query(None, description="Phone number"),
    mrn: Optional[str] = Query(None, description="Exact MRN"),
    patient_status: Optional[str] = Query(None, alias="status", description="Patient status filter"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    patients, total = await patient_service.search_patients(
        session=session,
        tenant_id=tenant_id,
        name=name,
        dob=dob,
        phone=phone,
        mrn=mrn,
        status=patient_status,
        skip=skip,
        limit=limit,
    )

    return PatientListResponse(
        patients=[PatientSummary.model_validate(p) for p in patients],
        total=total,
        skip=skip,
        limit=limit,
        tenant_id=str(tenant_id),
    )


@router.get(
    "/{patient_id}",
    response_model=PatientResponse,
    summary="Get patient by ID",
    description="Retrieve full patient identity including identifiers and contacts.",
)
async def get_patient(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    patient = await patient_service.get_patient_by_id(session, tenant_id, patient_id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found",
        )
    return patient


@router.get(
    "/{patient_id}/summary",
    response_model=PatientSummary,
    summary="Get patient summary",
    description="Lightweight patient summary for cross-service lookups.",
)
async def get_patient_summary(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    patient = await patient_service.get_patient_summary(session, tenant_id, patient_id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found",
        )
    return PatientSummary.model_validate(patient)


# ────────────────────────────────────────────────────────────────
#  UPDATE
# ────────────────────────────────────────────────────────────────

@router.put(
    "/{patient_id}",
    response_model=PatientResponse,
    summary="Update patient demographics",
    description="Partial update — only fields present in the request body are modified. "
    "Publishes PATIENT_UPDATED or PATIENT_DEACTIVATED event.",
)
async def update_patient(
    patient_id: uuid.UUID,
    data: PatientUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    patient = await patient_service.update_patient(
        session, tenant_id, patient_id, data
    )
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found",
        )

    await session.commit()
    await session.refresh(patient, ["identifiers", "contacts"])
    return patient


# ────────────────────────────────────────────────────────────────
#  DELETE (Soft)
# ────────────────────────────────────────────────────────────────

@router.delete(
    "/{patient_id}",
    response_model=PatientResponse,
    summary="Soft-delete a patient",
    description="Marks the patient as inactive with a deleted_at timestamp. "
    "Physical deletion is prohibited for healthcare compliance. "
    "Publishes PATIENT_DEACTIVATED event.",
)
async def delete_patient(
    patient_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    patient = await patient_service.soft_delete_patient(
        session, tenant_id, patient_id
    )
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found",
        )

    await session.commit()
    await session.refresh(patient, ["identifiers", "contacts"])
    return patient


# ────────────────────────────────────────────────────────────────
#  MPI LINKING
# ────────────────────────────────────────────────────────────────

@router.post(
    "/{patient_id}/link-mpi",
    response_model=MPILinkResponse,
    summary="Link patient to Master Patient Index",
    description="Associates a patient with an external MPI ID for cross-organization "
    "identity reconciliation. Publishes PATIENT_LINKED_TO_MPI event.",
)
async def link_mpi(
    patient_id: uuid.UUID,
    data: MPILinkRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)

    patient = await patient_service.link_patient_to_mpi(
        session, tenant_id, patient_id, data.mpi_id
    )
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found",
        )

    await session.commit()

    return MPILinkResponse(
        patient_id=patient.id,
        mpi_id=patient.mpi_id,
        tenant_id=patient.tenant_id,
        linked_at=patient.updated_at,
    )
