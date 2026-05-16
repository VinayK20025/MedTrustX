"""
MedTrustX Physical Access Control Service — Business Logic Layer
"""
import uuid
from typing import List

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.access import AccessLog, AccessPoint, AccessPolicy, Credential
from src.schemas.access import AccessCheckRequest, AccessCheckResponse, CredentialCreate, PointCreate, PolicyCreate
from src.services.event_publisher import publish_event

logger = structlog.get_logger()


# ── Configuration ──

async def create_point(session: AsyncSession, tenant_id: uuid.UUID, data: PointCreate) -> AccessPoint:
    pt = AccessPoint(tenant_id=tenant_id, name=data.name, location=data.location)
    session.add(pt)
    await session.flush()
    return pt

async def create_credential(session: AsyncSession, tenant_id: uuid.UUID, data: CredentialCreate) -> Credential:
    c = Credential(tenant_id=tenant_id, user_id=data.user_id, type=data.type, value=data.value)
    session.add(c)
    await session.flush()
    return c

async def create_policy(session: AsyncSession, tenant_id: uuid.UUID, data: PolicyCreate) -> AccessPolicy:
    p = AccessPolicy(tenant_id=tenant_id, role=data.role, zone=data.zone, rules=data.rules)
    session.add(p)
    await session.flush()
    return p


# ── Access Enforcement ──

async def verify_access(session: AsyncSession, tenant_id: uuid.UUID, data: AccessCheckRequest) -> AccessCheckResponse:
    # Look up the credential
    result = await session.execute(
        select(Credential).where(
            and_(
                Credential.tenant_id == tenant_id,
                Credential.type == data.credential_type,
                Credential.value == data.credential_value,
                Credential.status == "active",
                Credential.deleted_at.is_(None)
            )
        )
    )
    cred = result.scalar_one_or_none()

    granted = False
    reason = "credential_not_found_or_inactive"
    user_id = None

    if cred:
        # Simplistic validation: if cred is active, grant access.
        # In a real system, we would query the User's Role from IAM and cross-check against AccessPolicy.zone
        granted = True
        reason = "access_granted"
        user_id = cred.user_id

    # Audit logging
    log_entry = AccessLog(
        tenant_id=tenant_id,
        user_id=user_id,
        access_point_id=data.access_point_id,
        action="entry",
        status="granted" if granted else "denied"
    )
    session.add(log_entry)
    await session.flush()

    # Emitting Physical IoT Event
    event_type = "ACCESS_GRANTED" if granted else "ACCESS_DENIED"
    await publish_event(event_type, tenant_id, log_entry.id, {"user_id": str(user_id) if user_id else None, "access_point_id": str(data.access_point_id)})

    return AccessCheckResponse(granted=granted, user_id=user_id, reason=reason)


async def list_logs(session: AsyncSession, tenant_id: uuid.UUID) -> List[AccessLog]:
    result = await session.execute(
        select(AccessLog).where(
            and_(AccessLog.tenant_id == tenant_id, AccessLog.deleted_at.is_(None))
        ).order_by(AccessLog.created_at.desc()).limit(100)
    )
    return list(result.scalars().all())
