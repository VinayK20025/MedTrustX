"""
MedTrustX Step-CA Shim Service — API Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.pki import SignRequest, SignResponse, RevokeRequest, RenewRequest
from src.services import ca_service

router = APIRouter(tags=["PKI"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.post(
    "/1.0/sign",
    response_model=SignResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Sign a certificate request",
)
async def sign_cert(
    data: SignRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    resp = await ca_service.sign_certificate(session, tenant_id, data)
    await session.commit()
    return resp

@router.post(
    "/1.0/renew",
    response_model=SignResponse,
    summary="Renew a certificate",
)
async def renew_cert(
    data: RenewRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    # Mocking renewal
    tenant_id = _get_tenant_id(request)
    cert = await ca_service.get_certificate(session, tenant_id, data.cert_id)
    if not cert or cert.is_deleted:
        raise HTTPException(status_code=404, detail="Valid certificate not found")
        
    sign_req = SignRequest(service_id=cert.service_id, csr_pem="mock_renew_csr")
    resp = await ca_service.sign_certificate(session, tenant_id, sign_req)
    await session.commit()
    return resp

@router.post(
    "/1.0/revoke",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke a certificate",
)
async def revoke_cert(
    data: RevokeRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    success = await ca_service.revoke_certificate(session, tenant_id, data)
    if not success:
        raise HTTPException(status_code=404, detail="Certificate not found")
    await session.commit()
    return None

@router.get(
    "/1.0/certs/{cert_id}",
    summary="Get a certificate",
)
async def get_cert(
    cert_id: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    cert = await ca_service.get_certificate(session, tenant_id, cert_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
        
    return {
        "id": str(cert.id),
        "service_id": cert.service_id,
        "cert_pem": cert.cert_pem,
        "expires_at": cert.expires_at,
        "revoked": cert.is_deleted
    }

@router.get(
    "/roots.pem",
    summary="Get root certificates",
)
async def get_roots():
    roots_pem = "-----BEGIN CERTIFICATE-----\nMOCK_ROOT_CA\n-----END CERTIFICATE-----"
    return Response(content=roots_pem, media_type="application/x-pem-file")
