"""
MedTrustX Compliance Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.compliance import (
    Consent, Policy, LegalDocument, ComplianceCheck, Violation
)
from src.schemas.compliance import (
    ConsentCreate, ConsentUpdate,
    PolicyCreate, PolicyUpdate,
    LegalDocumentCreate,
    ComplianceCheckCreate,
    ViolationCreate
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
        status=data.status,
        granted_at=data.granted_at or (datetime.now(timezone.utc) if data.status == "granted" else None),
    )
    session.add(consent)
    await session.flush()
    
    if consent.status == "granted":
        await publish_event("CONSENT_GRANTED", tenant_id, consent.id, {
            "patient_id": str(consent.patient_id),
            "consent_type": consent.consent_type,
        })
    
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
        
    old_status = consent.status
    consent.status = data.status
    if data.status == "revoked" and old_status != "revoked":
        consent.revoked_at = data.revoked_at or datetime.now(timezone.utc)
        
    consent.updated_at = datetime.now(timezone.utc)
    await session.flush()
    
    if consent.status == "revoked" and old_status != "revoked":
        await publish_event("CONSENT_REVOKED", tenant_id, consent.id, {
            "patient_id": str(consent.patient_id),
            "consent_type": consent.consent_type,
        })
        
    return consent

# ── Policies ──

async def create_policy(
    session: AsyncSession, tenant_id: uuid.UUID, data: PolicyCreate
) -> Policy:
    policy = Policy(
        tenant_id=tenant_id,
        name=data.name,
        description=data.description,
        rules=data.rules,
        active=data.active,
    )
    session.add(policy)
    await session.flush()
    
    await publish_event("POLICY_UPDATED", tenant_id, policy.id, {"name": policy.name})
    return policy

async def get_policy(
    session: AsyncSession, tenant_id: uuid.UUID, policy_id: uuid.UUID
) -> Optional[Policy]:
    result = await session.execute(
        select(Policy).where(and_(Policy.id == policy_id, Policy.tenant_id == tenant_id, Policy.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_policy(
    session: AsyncSession, tenant_id: uuid.UUID, policy_id: uuid.UUID, data: PolicyUpdate
) -> Optional[Policy]:
    policy = await get_policy(session, tenant_id, policy_id)
    if not policy:
        return None
        
    if data.name:
        policy.name = data.name
    if data.description is not None:
        policy.description = data.description
    if data.rules is not None:
        policy.rules = data.rules
    if data.active is not None:
        policy.active = data.active
        
    policy.updated_at = datetime.now(timezone.utc)
    await session.flush()
    
    await publish_event("POLICY_UPDATED", tenant_id, policy.id, {"name": policy.name})
    return policy

# ── Legal Documents ──

async def create_document(
    session: AsyncSession, tenant_id: uuid.UUID, data: LegalDocumentCreate
) -> LegalDocument:
    doc = LegalDocument(
        tenant_id=tenant_id,
        document_type=data.document_type,
        file_url=data.file_url,
        version=data.version,
    )
    session.add(doc)
    await session.flush()
    return doc

async def get_document(
    session: AsyncSession, tenant_id: uuid.UUID, document_id: uuid.UUID
) -> Optional[LegalDocument]:
    result = await session.execute(
        select(LegalDocument).where(and_(LegalDocument.id == document_id, LegalDocument.tenant_id == tenant_id, LegalDocument.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Compliance Checks ──

async def create_check(
    session: AsyncSession, tenant_id: uuid.UUID, data: ComplianceCheckCreate
) -> ComplianceCheck:
    check = ComplianceCheck(
        tenant_id=tenant_id,
        entity_type=data.entity_type,
        entity_id=data.entity_id,
        status=data.status,
    )
    session.add(check)
    await session.flush()
    return check

async def get_check(
    session: AsyncSession, tenant_id: uuid.UUID, check_id: uuid.UUID
) -> Optional[ComplianceCheck]:
    result = await session.execute(
        select(ComplianceCheck).where(and_(ComplianceCheck.id == check_id, ComplianceCheck.tenant_id == tenant_id, ComplianceCheck.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

# ── Violations ──

async def create_violation(
    session: AsyncSession, tenant_id: uuid.UUID, data: ViolationCreate
) -> Violation:
    violation = Violation(
        tenant_id=tenant_id,
        violation_type=data.violation_type,
        description=data.description,
        severity=data.severity,
        status=data.status,
    )
    session.add(violation)
    await session.flush()
    
    await publish_event("VIOLATION_REPORTED", tenant_id, violation.id, {
        "violation_type": violation.violation_type,
        "severity": violation.severity,
    })
    
    return violation

async def get_violation(
    session: AsyncSession, tenant_id: uuid.UUID, violation_id: uuid.UUID
) -> Optional[Violation]:
    result = await session.execute(
        select(Violation).where(and_(Violation.id == violation_id, Violation.tenant_id == tenant_id, Violation.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()
