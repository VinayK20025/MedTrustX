"""
MedTrustX Credentialing Service — Business Logic Layer

Credential lifecycle management, verification workflows, privilege
granting, privileging request approval, and immutable audit event logging.
"""
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from sqlalchemy import and_, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.credentialing import (
    Credential,
    CredentialEvent,
    CredentialVerification,
    Privilege,
    PrivilegingRequest,
)
from src.schemas.credentialing import (
    CredentialCreateRequest,
    PrivilegeCreateRequest,
    PrivilegingRequestCreate,
    VerifyCredentialRequest,
)
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


async def _log_event(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    user_id: uuid.UUID,
    event_type: str,
    payload: Dict[str, Any],
) -> None:
    """Append an immutable audit event to credential_events."""
    event = CredentialEvent(
        tenant_id=tenant_id,
        user_id=user_id,
        event_type=event_type,
        payload=payload,
    )
    session.add(event)
    await session.flush()


# ── Credentials ──

async def create_credential(
    session: AsyncSession, tenant_id: uuid.UUID, data: CredentialCreateRequest
) -> Credential:
    cred = Credential(
        tenant_id=tenant_id,
        user_id=data.user_id,
        credential_type=data.credential_type,
        issuing_authority=data.issuing_authority,
        license_number=data.license_number,
        status="pending",
        expires_at=data.expires_at,
    )
    session.add(cred)
    await session.flush()
    await _log_event(session, tenant_id, data.user_id, "CREDENTIAL_CREATED", {"credential_id": str(cred.id), "type": data.credential_type})
    return cred


async def get_credential(
    session: AsyncSession, tenant_id: uuid.UUID, cred_id: uuid.UUID
) -> Optional[Credential]:
    result = await session.execute(
        select(Credential).where(and_(Credential.id == cred_id, Credential.tenant_id == tenant_id, Credential.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


async def get_user_credentials(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID
) -> List[Credential]:
    result = await session.execute(
        select(Credential).where(and_(Credential.tenant_id == tenant_id, Credential.user_id == user_id, Credential.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Verification ──

async def verify_credential(
    session: AsyncSession, tenant_id: uuid.UUID, cred_id: uuid.UUID, data: VerifyCredentialRequest
) -> CredentialVerification:
    cred = await get_credential(session, tenant_id, cred_id)
    if not cred:
        raise ValueError("Credential not found")

    verification = CredentialVerification(
        tenant_id=tenant_id,
        credential_id=cred_id,
        verifier_id=data.verifier_id,
        status="verified",
        verified_at=datetime.now(timezone.utc),
        notes=data.notes,
    )
    session.add(verification)

    cred.status = "verified"
    await session.flush()

    await _log_event(session, tenant_id, cred.user_id, "CREDENTIAL_VERIFIED", {"credential_id": str(cred_id), "verifier_id": str(data.verifier_id)})
    await publish_event("CREDENTIAL_VERIFIED", tenant_id, cred_id, {"user_id": str(cred.user_id), "type": cred.credential_type})
    return verification


# ── Privileges ──

async def create_privilege(
    session: AsyncSession, tenant_id: uuid.UUID, data: PrivilegeCreateRequest
) -> Privilege:
    priv = Privilege(
        tenant_id=tenant_id,
        user_id=data.user_id,
        privilege_type=data.privilege_type,
        status="active",
        scope=data.scope,
        expires_at=data.expires_at,
    )
    session.add(priv)
    await session.flush()

    await _log_event(session, tenant_id, data.user_id, "PRIVILEGE_GRANTED", {"privilege_id": str(priv.id), "type": data.privilege_type})
    await publish_event("PRIVILEGE_GRANTED", tenant_id, priv.id, {"user_id": str(data.user_id), "privilege": data.privilege_type})
    return priv


async def get_privilege(
    session: AsyncSession, tenant_id: uuid.UUID, priv_id: uuid.UUID
) -> Optional[Privilege]:
    result = await session.execute(
        select(Privilege).where(and_(Privilege.id == priv_id, Privilege.tenant_id == tenant_id, Privilege.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


async def get_user_privileges(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID
) -> List[Privilege]:
    result = await session.execute(
        select(Privilege).where(and_(Privilege.tenant_id == tenant_id, Privilege.user_id == user_id, Privilege.deleted_at.is_(None)))
    )
    return list(result.scalars().all())


# ── Privileging Requests ──

async def create_privileging_request(
    session: AsyncSession, tenant_id: uuid.UUID, data: PrivilegingRequestCreate
) -> PrivilegingRequest:
    req = PrivilegingRequest(
        tenant_id=tenant_id,
        user_id=data.user_id,
        requested_privilege=data.requested_privilege,
        status="submitted",
        justification=data.justification,
    )
    session.add(req)
    await session.flush()
    await _log_event(session, tenant_id, data.user_id, "PRIVILEGING_REQUESTED", {"request_id": str(req.id), "privilege": data.requested_privilege})
    return req


async def get_privileging_request(
    session: AsyncSession, tenant_id: uuid.UUID, req_id: uuid.UUID
) -> Optional[PrivilegingRequest]:
    result = await session.execute(
        select(PrivilegingRequest).where(and_(PrivilegingRequest.id == req_id, PrivilegingRequest.tenant_id == tenant_id, PrivilegingRequest.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()


async def approve_privileging_request(
    session: AsyncSession, tenant_id: uuid.UUID, req_id: uuid.UUID, reviewer_id: uuid.UUID
) -> Optional[PrivilegingRequest]:
    req = await get_privileging_request(session, tenant_id, req_id)
    if not req:
        return None

    req.status = "approved"
    req.approved_at = datetime.now(timezone.utc)
    req.reviewed_by = reviewer_id

    # Auto-grant privilege upon approval
    priv = Privilege(
        tenant_id=tenant_id,
        user_id=req.user_id,
        privilege_type=req.requested_privilege,
        status="active",
    )
    session.add(priv)
    await session.flush()

    await _log_event(session, tenant_id, req.user_id, "PRIVILEGING_APPROVED", {"request_id": str(req_id), "privilege": req.requested_privilege, "reviewer": str(reviewer_id)})
    await publish_event("PRIVILEGE_GRANTED", tenant_id, priv.id, {"user_id": str(req.user_id), "privilege": req.requested_privilege})
    return req
