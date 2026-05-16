"""
MedTrustX Medical Records Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import and_, desc, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
import structlog

from src.models.records import MedicalRecord, RecordAuditLog, RecordDocument
from src.schemas.records import MedicalRecordCreate, MedicalRecordUpdate, RecordDocumentCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def _log_audit(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    record_id: uuid.UUID,
    user_id: uuid.UUID,
    action: str,
) -> None:
    """Internal helper to enforce audit logging."""
    audit_log = RecordAuditLog(
        tenant_id=tenant_id,
        record_id=record_id,
        action=action,
        performed_by=user_id,
    )
    session.add(audit_log)


# ── Medical Records ─────────────────────────────────────────────
async def create_record(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    data: MedicalRecordCreate,
) -> MedicalRecord:
    record = MedicalRecord(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        encounter_id=data.encounter_id,
        record_type=data.record_type,
        source_service=data.source_service,
        reference_id=data.reference_id,
        title=data.title,
        summary_data=data.summary_data,
        version=1,
    )
    session.add(record)
    await session.flush()

    if data.documents:
        for doc_data in data.documents:
            doc = RecordDocument(
                tenant_id=tenant_id,
                record_id=record.id,
                file_url=doc_data.file_url,
                file_type=doc_data.file_type,
                file_size_bytes=doc_data.file_size_bytes,
                uploaded_by=user_id,
            )
            session.add(doc)

    await _log_audit(session, tenant_id, record.id, user_id, "created")
    await session.flush()

    await publish_event(
        "MEDICAL_RECORD_CREATED",
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        payload={"record_id": str(record.id), "record_type": data.record_type},
    )
    return record


async def get_record(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    record_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Optional[MedicalRecord]:
    result = await session.execute(
        select(MedicalRecord)
        .options(selectinload(MedicalRecord.documents))
        .where(
            and_(
                MedicalRecord.id == record_id,
                MedicalRecord.tenant_id == tenant_id,
                MedicalRecord.deleted_at.is_(None),
            )
        )
    )
    record = result.scalar_one_or_none()
    
    if record:
        await _log_audit(session, tenant_id, record.id, user_id, "accessed")
        await session.flush()
        
    return record


async def update_record(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    record_id: uuid.UUID,
    user_id: uuid.UUID,
    data: MedicalRecordUpdate,
) -> Optional[MedicalRecord]:
    result = await session.execute(
        select(MedicalRecord).where(
            and_(
                MedicalRecord.id == record_id,
                MedicalRecord.tenant_id == tenant_id,
                MedicalRecord.deleted_at.is_(None),
            )
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        return None

    changed = False
    if data.title and data.title != record.title:
        record.title = data.title
        changed = True
        
    if data.summary_data and data.summary_data != record.summary_data:
        record.summary_data = data.summary_data
        changed = True

    if changed:
        record.version += 1
        record.updated_at = datetime.now(timezone.utc)
        await _log_audit(session, tenant_id, record.id, user_id, "updated")
        await session.flush()

        await publish_event(
            "MEDICAL_RECORD_UPDATED",
            tenant_id=tenant_id,
            patient_id=record.patient_id,
            payload={"record_id": str(record.id), "version": record.version},
        )

    return record


async def get_patient_timeline(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    user_id: uuid.UUID,
) -> List[MedicalRecord]:
    # In a real system we would log a summary "timeline_accessed" audit event
    result = await session.execute(
        select(MedicalRecord)
        .options(selectinload(MedicalRecord.documents))
        .where(
            and_(
                MedicalRecord.patient_id == patient_id,
                MedicalRecord.tenant_id == tenant_id,
                MedicalRecord.deleted_at.is_(None),
            )
        )
        .order_by(desc(MedicalRecord.created_at))
    )
    return list(result.scalars().all())


# ── Documents ───────────────────────────────────────────────────
async def attach_document(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    record_id: uuid.UUID,
    user_id: uuid.UUID,
    data: RecordDocumentCreate,
) -> Optional[RecordDocument]:
    # Verify record exists
    result = await session.execute(
        select(MedicalRecord).where(
            and_(
                MedicalRecord.id == record_id,
                MedicalRecord.tenant_id == tenant_id,
                MedicalRecord.deleted_at.is_(None),
            )
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        return None

    doc = RecordDocument(
        tenant_id=tenant_id,
        record_id=record_id,
        file_url=data.file_url,
        file_type=data.file_type,
        file_size_bytes=data.file_size_bytes,
        uploaded_by=user_id,
    )
    session.add(doc)
    
    await _log_audit(session, tenant_id, record.id, user_id, "updated")
    await session.flush()

    await publish_event(
        "DOCUMENT_UPLOADED",
        tenant_id=tenant_id,
        patient_id=record.patient_id,
        payload={"record_id": str(record.id), "document_id": str(doc.id)},
    )
    return doc


# ── EHR Export ──────────────────────────────────────────────────
async def mock_fhir_export(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    patient_id: uuid.UUID,
    user_id: uuid.UUID,
) -> dict:
    records = await get_patient_timeline(session, tenant_id, patient_id, user_id)
    
    # Mocking a basic FHIR Bundle compilation
    bundle = {
        "resourceType": "Bundle",
        "type": "collection",
        "entry": []
    }
    
    for rec in records:
        entry = {
            "resource": {
                "resourceType": "DocumentReference",
                "id": str(rec.id),
                "status": "current",
                "type": {
                    "text": rec.record_type
                },
                "subject": {
                    "reference": f"Patient/{rec.patient_id}"
                },
                "date": rec.created_at.isoformat(),
                "description": rec.title
            }
        }
        bundle["entry"].append(entry)
        
        # Log audit for each record accessed via export
        await _log_audit(session, tenant_id, rec.id, user_id, "exported")

    await session.flush()
    
    await publish_event(
        "EHR_EXPORTED",
        tenant_id=tenant_id,
        patient_id=patient_id,
        payload={"records_count": len(records)},
    )

    return bundle
