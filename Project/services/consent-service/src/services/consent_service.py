"""
MedTrustX Consent Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.consent import Consent, ConsentRecord, ConsentLog, ConsentValidation, ConsentPolicy
from src.schemas.consent import (
    ConsentCreate, ConsentUpdate, ValidationRequest, ValidationResponse
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Consents ──

async def create_consent(
    session: AsyncSession, tenant_id: uuid.UUID, data: ConsentCreate
) -> Consent:
    consent = Consent(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        consent_type=data.consent_type,
        scope=data.scope,
        status="granted",
        expires_at=data.expires_at
    )
    session.add(consent)
    await session.flush()
    
    if data.document_url:
        record = ConsentRecord(
            tenant_id=tenant_id,
            consent_id=consent.id,
            document_url=data.document_url,
            version=1
        )
        session.add(record)
        
    log = ConsentLog(
        tenant_id=tenant_id,
        consent_id=consent.id,
        action="created",
        performed_by=data.performed_by
    )
    session.add(log)
    await session.flush()
    
    await publish_event("CONSENT_GRANTED", tenant_id, consent.id, {"patient_id": str(data.patient_id), "consent_type": data.consent_type})
    return consent

async def get_consent(
    session: AsyncSession, tenant_id: uuid.UUID, consent_id: uuid.UUID
) -> Optional[Consent]:
    result = await session.execute(
        select(Consent).where(and_(Consent.id == consent_id, Consent.tenant_id == tenant_id, Consent.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_consent(
    session: AsyncSession, tenant_id: uuid.UUID, consent_id: uuid.UUID, data: ConsentUpdate
) -> Optional[Consent]:
    consent = await get_consent(session, tenant_id, consent_id)
    if not consent:
        return None
        
    if data.scope is not None:
        consent.scope = data.scope
    if data.expires_at is not None:
        consent.expires_at = data.expires_at
        
    log = ConsentLog(
        tenant_id=tenant_id,
        consent_id=consent.id,
        action="updated",
        performed_by=data.performed_by
    )
    session.add(log)
    await session.flush()
    return consent

async def revoke_consent(
    session: AsyncSession, tenant_id: uuid.UUID, consent_id: uuid.UUID, performed_by: uuid.UUID
) -> Optional[Consent]:
    consent = await get_consent(session, tenant_id, consent_id)
    if not consent or consent.status == "revoked":
        return None
        
    consent.status = "revoked"
    consent.revoked_at = datetime.now(timezone.utc)
    
    log = ConsentLog(
        tenant_id=tenant_id,
        consent_id=consent.id,
        action="revoked",
        performed_by=performed_by
    )
    session.add(log)
    await session.flush()
    
    await publish_event("CONSENT_REVOKED", tenant_id, consent.id, {"patient_id": str(consent.patient_id), "consent_type": consent.consent_type})
    return consent

async def get_patient_consents(
    session: AsyncSession, tenant_id: uuid.UUID, patient_id: uuid.UUID
) -> List[Consent]:
    result = await session.execute(
        select(Consent).where(and_(Consent.patient_id == patient_id, Consent.tenant_id == tenant_id, Consent.deleted_at.is_(None)))
    )
    return list(result.scalars().all())

async def get_consent_logs(
    session: AsyncSession, tenant_id: uuid.UUID, consent_id: uuid.UUID
) -> List[ConsentLog]:
    result = await session.execute(
        select(ConsentLog).where(and_(ConsentLog.consent_id == consent_id, ConsentLog.tenant_id == tenant_id, ConsentLog.deleted_at.is_(None))).order_by(ConsentLog.timestamp.desc())
    )
    return list(result.scalars().all())

# ── Validation ──

async def validate_consent(
    session: AsyncSession, tenant_id: uuid.UUID, data: ValidationRequest
) -> ValidationResponse:
    # Basic logic: check if there is an active consent of the given type for the patient
    result = await session.execute(
        select(Consent).where(and_(
            Consent.patient_id == data.patient_id, 
            Consent.tenant_id == tenant_id,
            Consent.consent_type == data.consent_type,
            Consent.status == "granted",
            Consent.deleted_at.is_(None)
        ))
    )
    consent = result.scalars().first()
    
    is_valid = False
    reason = "no_active_consent"
    
    if consent:
        if consent.expires_at and consent.expires_at < datetime.now(timezone.utc):
            reason = "consent_expired"
        else:
            is_valid = True
            reason = "valid"
            
    val_record = ConsentValidation(
        tenant_id=tenant_id,
        patient_id=data.patient_id,
        resource=data.resource,
        action=data.action,
        result="allowed" if is_valid else "denied"
    )
    session.add(val_record)
    await session.flush()
    
    await publish_event("CONSENT_VALIDATED", tenant_id, None, {"patient_id": str(data.patient_id), "resource": data.resource, "valid": is_valid})
    
    return ValidationResponse(
        patient_id=data.patient_id,
        resource=data.resource,
        action=data.action,
        consent_valid=is_valid,
        reason=reason if not is_valid else None
    )
