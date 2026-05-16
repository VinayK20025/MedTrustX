"""
MedTrustX Step-CA Shim Service — Business Logic Layer
"""
import uuid
import datetime
import base64
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
from cryptography import x509
from cryptography.x509.oid import NameOID
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.pki import CACertificate, CARevokedCert, CATrustChain
from src.schemas.pki import SignRequest, SignResponse, RevokeRequest
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# Dummy key for CA signing in shim
_ca_private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

async def sign_certificate(
    session: AsyncSession, tenant_id: uuid.UUID, data: SignRequest
) -> SignResponse:
    # In a real scenario, we would parse data.csr_pem.
    # Here we mock issuing a cert.
    
    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24) # default 24h
    
    mock_cert_pem = f"-----BEGIN CERTIFICATE-----\nMOCK_CERT_FOR_{data.service_id}\n-----END CERTIFICATE-----"
    
    cert = CACertificate(
        tenant_id=tenant_id,
        service_id=data.service_id,
        cert_pem=mock_cert_pem,
        expires_at=expires_at
    )
    session.add(cert)
    await session.flush()
    
    await publish_event("CERT_ISSUED", tenant_id, cert.id, {"service_id": data.service_id, "ttl": data.ttl})
    
    return SignResponse(
        id=str(cert.id),
        service_id=cert.service_id,
        cert_pem=cert.cert_pem,
        expires_at=cert.expires_at
    )

async def revoke_certificate(
    session: AsyncSession, tenant_id: uuid.UUID, data: RevokeRequest
) -> bool:
    cert_uuid = uuid.UUID(data.cert_id)
    
    result = await session.execute(
        select(CACertificate).where(and_(CACertificate.id == cert_uuid, CACertificate.tenant_id == tenant_id, CACertificate.deleted_at.is_(None)))
    )
    cert = result.scalar_one_or_none()
    
    if not cert:
        return False
        
    revocation = CARevokedCert(
        tenant_id=tenant_id,
        cert_id=cert.id,
        reason=data.reason
    )
    session.add(revocation)
    
    # Soft delete the active cert record so it's not considered valid
    cert.soft_delete()
    
    await session.flush()
    await publish_event("CERT_REVOKED", tenant_id, cert.id, {"reason": data.reason})
    return True

async def get_certificate(
    session: AsyncSession, tenant_id: uuid.UUID, cert_id: str
) -> CACertificate:
    cert_uuid = uuid.UUID(cert_id)
    result = await session.execute(
        select(CACertificate).where(and_(CACertificate.id == cert_uuid, CACertificate.tenant_id == tenant_id))
    )
    return result.scalar_one_or_none()
