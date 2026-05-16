"""
MedTrustX Patient Service — Business Logic Layer

This module contains ALL domain logic for patient identity management.
Routes delegate to this service; it coordinates DB access, validation,
MRN generation, event publishing, and tenant isolation.

Design decisions:
  - Every query is tenant-scoped (defense-in-depth on top of RLS)
  - Soft-deletes only — no physical removal of patient records
  - MRN auto-generation uses tenant-specific prefix + sequence
  - All mutations publish domain events for downstream consumers
"""
import uuid
from datetime import date, datetime, timezone
from typing import List, Optional, Tuple

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.patient import Patient, PatientContact, PatientIdentifier
from src.schemas.patient import (
    ContactCreate,
    ContactUpdate,
    IdentifierCreate,
    PatientCreate,
    PatientUpdate,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ════════════════════════════════════════════════════════════════
#  MRN GENERATION
# ════════════════════════════════════════════════════════════════

async def _generate_mrn(session: AsyncSession, tenant_id: uuid.UUID) -> str:
    """
    Generate a unique Medical Record Number for a tenant.

    Format: ``HOSP<5-digit-sequence>`` (e.g., HOSP00001)

    In production, this should use a PostgreSQL sequence per tenant
    or a distributed ID generator. For now we use MAX(mrn) + 1.
    """
    result = await session.execute(
        select(func.count(Patient.id)).where(
            and_(
                Patient.tenant_id == tenant_id,
                Patient.deleted_at.is_(None),
            )
        )
    )
    count = result.scalar_one() + 1
    return f"HOSP{count:05d}"


# ════════════════════════════════════════════════════════════════
#  PATIENT CRUD
# ════════════════════════════════════════════════════════════════

async def create_patient(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    data: PatientCreate,
) -> Patient:
    """
    Register a new patient identity.

    1. Generate MRN
    2. Persist patient record
    3. Auto-create MRN identifier entry
    4. Publish PATIENT_CREATED event
    """
    mrn = await _generate_mrn(session, tenant_id)

    patient = Patient(
        tenant_id=tenant_id,
        mrn=mrn,
        first_name=data.first_name,
        last_name=data.last_name,
        dob=data.dob,
        gender=data.gender,
        blood_group=data.blood_group,
        phone=data.phone,
        email=data.email,
        address_line1=data.address_line1,
        address_line2=data.address_line2,
        city=data.city,
        state=data.state,
        postal_code=data.postal_code,
        country=data.country or "IN",
        status="active",
    )
    session.add(patient)
    await session.flush()  # Get patient.id before creating identifier

    # Auto-create MRN as a primary identifier
    mrn_identifier = PatientIdentifier(
        tenant_id=tenant_id,
        patient_id=patient.id,
        type="MRN",
        value=mrn,
    )
    session.add(mrn_identifier)
    await session.flush()

    logger.info(
        "patient_created",
        patient_id=str(patient.id),
        mrn=mrn,
        tenant_id=str(tenant_id),
    )

    # Publish event (non-blocking, best-effort)
    await publish_event(
        event_type="PATIENT_CREATED",
        patient_id=patient.id,
        tenant_id=tenant_id,
        payload={
            "mrn": mrn,
            "first_name": data.first_name,
            "last_name": data.last_name,
            "status": "active",
        },
    )

    return patient


async def get_patient_by_id(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> Optional[Patient]:
    """
    Fetch a single patient by ID within the tenant scope.
    Returns None if not found or soft-deleted.
    """
    result = await session.execute(
        select(Patient).where(
            and_(
                Patient.id == patient_id,
                Patient.tenant_id == tenant_id,
                Patient.deleted_at.is_(None),
            )
        )
    )
    return result.scalar_one_or_none()


async def update_patient(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    data: PatientUpdate,
) -> Optional[Patient]:
    """
    Partial update of patient demographics.
    Only non-None fields are applied.
    """
    patient = await get_patient_by_id(session, tenant_id, patient_id)
    if patient is None:
        return None

    update_data = data.model_dump(exclude_unset=True, exclude_none=True)
    if not update_data:
        return patient

    old_status = patient.status

    for field, value in update_data.items():
        setattr(patient, field, value)

    patient.updated_at = datetime.now(timezone.utc)
    await session.flush()

    logger.info(
        "patient_updated",
        patient_id=str(patient_id),
        fields=list(update_data.keys()),
        tenant_id=str(tenant_id),
    )

    # Determine event type
    event_type = "PATIENT_UPDATED"
    if "status" in update_data:
        new_status = update_data["status"]
        if new_status in ("inactive", "deceased"):
            event_type = "PATIENT_DEACTIVATED"

    await publish_event(
        event_type=event_type,
        patient_id=patient.id,
        tenant_id=tenant_id,
        payload={
            "updated_fields": list(update_data.keys()),
            "status": patient.status,
            "previous_status": old_status,
        },
    )

    return patient


async def soft_delete_patient(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> Optional[Patient]:
    """
    Soft-delete a patient. Sets deleted_at timestamp and status to 'inactive'.
    Physical deletion is prohibited for healthcare compliance.
    """
    patient = await get_patient_by_id(session, tenant_id, patient_id)
    if patient is None:
        return None

    patient.soft_delete()
    patient.status = "inactive"
    patient.updated_at = datetime.now(timezone.utc)
    await session.flush()

    logger.info(
        "patient_soft_deleted",
        patient_id=str(patient_id),
        tenant_id=str(tenant_id),
    )

    await publish_event(
        event_type="PATIENT_DEACTIVATED",
        patient_id=patient.id,
        tenant_id=tenant_id,
        payload={"reason": "soft_delete"},
    )

    return patient


# ════════════════════════════════════════════════════════════════
#  SEARCH & LIST
# ════════════════════════════════════════════════════════════════

async def search_patients(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    name: Optional[str] = None,
    dob: Optional[date] = None,
    phone: Optional[str] = None,
    mrn: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> Tuple[List[Patient], int]:
    """
    Search patients within a tenant with optional filters.
    Returns (results, total_count) for pagination.
    """
    base_filter = and_(
        Patient.tenant_id == tenant_id,
        Patient.deleted_at.is_(None),
    )

    conditions = [base_filter]

    if name:
        name_filter = or_(
            Patient.first_name.ilike(f"%{name}%"),
            Patient.last_name.ilike(f"%{name}%"),
        )
        conditions.append(name_filter)

    if dob:
        conditions.append(Patient.dob == dob)

    if phone:
        conditions.append(Patient.phone.ilike(f"%{phone}%"))

    if mrn:
        conditions.append(Patient.mrn == mrn)

    if status:
        conditions.append(Patient.status == status)

    where_clause = and_(*conditions)

    # Count query
    count_result = await session.execute(
        select(func.count(Patient.id)).where(where_clause)
    )
    total = count_result.scalar_one()

    # Data query
    result = await session.execute(
        select(Patient)
        .where(where_clause)
        .order_by(Patient.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    patients = list(result.scalars().all())

    return patients, total


async def get_patient_summary(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> Optional[Patient]:
    """
    Get a lightweight patient summary (same as get_patient_by_id
    but intended for cross-service lookups with minimal data).
    """
    return await get_patient_by_id(session, tenant_id, patient_id)


# ════════════════════════════════════════════════════════════════
#  MPI LINKING
# ════════════════════════════════════════════════════════════════

async def link_patient_to_mpi(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    mpi_id: uuid.UUID,
) -> Optional[Patient]:
    """
    Link a patient to the Master Patient Index for cross-organization
    identity reconciliation.
    """
    patient = await get_patient_by_id(session, tenant_id, patient_id)
    if patient is None:
        return None

    patient.mpi_id = mpi_id
    patient.updated_at = datetime.now(timezone.utc)
    await session.flush()

    logger.info(
        "patient_linked_to_mpi",
        patient_id=str(patient_id),
        mpi_id=str(mpi_id),
        tenant_id=str(tenant_id),
    )

    await publish_event(
        event_type="PATIENT_LINKED_TO_MPI",
        patient_id=patient.id,
        tenant_id=tenant_id,
        payload={"mpi_id": mpi_id},
    )

    return patient


# ════════════════════════════════════════════════════════════════
#  IDENTIFIERS
# ════════════════════════════════════════════════════════════════

async def add_identifier(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    data: IdentifierCreate,
) -> Optional[PatientIdentifier]:
    """Add a secondary identifier (UHID, Aadhaar hash, passport, etc.)."""
    # Verify patient exists in this tenant
    patient = await get_patient_by_id(session, tenant_id, patient_id)
    if patient is None:
        return None

    identifier = PatientIdentifier(
        tenant_id=tenant_id,
        patient_id=patient_id,
        type=data.type.upper(),
        value=data.value,
    )
    session.add(identifier)
    await session.flush()

    logger.info(
        "identifier_added",
        patient_id=str(patient_id),
        type=data.type,
        tenant_id=str(tenant_id),
    )

    return identifier


async def list_identifiers(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[PatientIdentifier]:
    """List all identifiers for a patient."""
    result = await session.execute(
        select(PatientIdentifier).where(
            and_(
                PatientIdentifier.patient_id == patient_id,
                PatientIdentifier.tenant_id == tenant_id,
                PatientIdentifier.deleted_at.is_(None),
            )
        )
    )
    return list(result.scalars().all())


async def delete_identifier(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    identifier_id: uuid.UUID,
) -> bool:
    """Soft-delete an identifier. Returns True if found and deleted."""
    result = await session.execute(
        select(PatientIdentifier).where(
            and_(
                PatientIdentifier.id == identifier_id,
                PatientIdentifier.patient_id == patient_id,
                PatientIdentifier.tenant_id == tenant_id,
                PatientIdentifier.deleted_at.is_(None),
            )
        )
    )
    identifier = result.scalar_one_or_none()
    if identifier is None:
        return False

    identifier.soft_delete()
    await session.flush()
    return True


# ════════════════════════════════════════════════════════════════
#  CONTACTS
# ════════════════════════════════════════════════════════════════

async def add_contact(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    data: ContactCreate,
) -> Optional[PatientContact]:
    """Add an emergency contact / next-of-kin."""
    patient = await get_patient_by_id(session, tenant_id, patient_id)
    if patient is None:
        return None

    # If this is marked primary, unset any existing primary
    if data.is_primary:
        await session.execute(
            update(PatientContact)
            .where(
                and_(
                    PatientContact.patient_id == patient_id,
                    PatientContact.tenant_id == tenant_id,
                    PatientContact.is_primary.is_(True),
                )
            )
            .values(is_primary=False)
        )

    contact = PatientContact(
        tenant_id=tenant_id,
        patient_id=patient_id,
        name=data.name,
        relationship_type=data.relationship_type,
        phone=data.phone,
        email=data.email,
        is_primary=data.is_primary,
    )
    session.add(contact)
    await session.flush()

    logger.info(
        "contact_added",
        patient_id=str(patient_id),
        contact_name=data.name,
        tenant_id=str(tenant_id),
    )

    return contact


async def list_contacts(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
) -> List[PatientContact]:
    """List all contacts for a patient."""
    result = await session.execute(
        select(PatientContact).where(
            and_(
                PatientContact.patient_id == patient_id,
                PatientContact.tenant_id == tenant_id,
                PatientContact.deleted_at.is_(None),
            )
        )
    )
    return list(result.scalars().all())


async def update_contact(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    contact_id: uuid.UUID,
    data: ContactUpdate,
) -> Optional[PatientContact]:
    """Update an existing contact."""
    result = await session.execute(
        select(PatientContact).where(
            and_(
                PatientContact.id == contact_id,
                PatientContact.patient_id == patient_id,
                PatientContact.tenant_id == tenant_id,
                PatientContact.deleted_at.is_(None),
            )
        )
    )
    contact = result.scalar_one_or_none()
    if contact is None:
        return None

    update_data = data.model_dump(exclude_unset=True, exclude_none=True)

    # If setting as primary, unset others first
    if update_data.get("is_primary"):
        await session.execute(
            update(PatientContact)
            .where(
                and_(
                    PatientContact.patient_id == patient_id,
                    PatientContact.tenant_id == tenant_id,
                    PatientContact.id != contact_id,
                    PatientContact.is_primary.is_(True),
                )
            )
            .values(is_primary=False)
        )

    for field, value in update_data.items():
        setattr(contact, field, value)

    contact.updated_at = datetime.now(timezone.utc)
    await session.flush()

    return contact


async def delete_contact(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    contact_id: uuid.UUID,
) -> bool:
    """Soft-delete a contact. Returns True if found and deleted."""
    result = await session.execute(
        select(PatientContact).where(
            and_(
                PatientContact.id == contact_id,
                PatientContact.patient_id == patient_id,
                PatientContact.tenant_id == tenant_id,
                PatientContact.deleted_at.is_(None),
            )
        )
    )
    contact = result.scalar_one_or_none()
    if contact is None:
        return False

    contact.soft_delete()
    await session.flush()
    return True
