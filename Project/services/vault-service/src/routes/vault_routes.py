"""
MedTrustX Vault Shim Service — API Routes
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.schemas.vault import (
    AuthLoginRequest, AuthLoginResponse,
    SecretPutRequest, SecretResponse,
    CredsResponse,
    TransitEncryptRequest, TransitEncryptResponse,
    TransitDecryptRequest, TransitDecryptResponse
)
from src.services import vault_service

router = APIRouter(prefix="/v1", tags=["Vault"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

# ── Auth ──
@router.post(
    "/auth/{method}/login",
    response_model=AuthLoginResponse,
    summary="Login",
)
async def login(
    method: str,
    data: AuthLoginRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    resp = await vault_service.login(session, tenant_id, data)
    await session.commit()
    return resp

# ── Secret Engine ──
@router.get(
    "/secret/data/{path:path}",
    response_model=SecretResponse,
    summary="Read Secret",
)
async def read_secret(
    path: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    secret = await vault_service.get_secret(session, tenant_id, path)
    if not secret:
        raise HTTPException(status_code=404, detail="Secret not found")
    return SecretResponse(data=secret.secret_data, version=secret.version)

@router.post(
    "/secret/data/{path:path}",
    response_model=SecretResponse,
    summary="Write Secret",
)
async def write_secret(
    path: str,
    data: SecretPutRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    secret = await vault_service.put_secret(session, tenant_id, path, data)
    await session.commit()
    return SecretResponse(data=secret.secret_data, version=secret.version)

# ── Database Engine ──
@router.get(
    "/database/creds/{role}",
    response_model=CredsResponse,
    summary="Generate Dynamic DB Credentials",
)
async def db_creds(
    role: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    u, p, ttl = await vault_service.generate_db_creds(session, tenant_id, role)
    await session.commit()
    return CredsResponse(username=u, password=p, ttl=ttl)

# ── Transit Engine ──
@router.post(
    "/transit/encrypt/{key}",
    response_model=TransitEncryptResponse,
    summary="Encrypt Data",
)
async def encrypt(
    key: str,
    data: TransitEncryptRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    ct = await vault_service.transit_encrypt(session, tenant_id, key, data.plaintext)
    await session.commit()
    return TransitEncryptResponse(ciphertext=ct)

@router.post(
    "/transit/decrypt/{key}",
    response_model=TransitDecryptResponse,
    summary="Decrypt Data",
)
async def decrypt(
    key: str,
    data: TransitDecryptRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    tenant_id = _get_tenant_id(request)
    try:
        pt = await vault_service.transit_decrypt(session, tenant_id, key, data.ciphertext)
        await session.commit()
        return TransitDecryptResponse(plaintext=pt)
    except ValueError:
        raise HTTPException(status_code=400, detail="Decryption failed")
