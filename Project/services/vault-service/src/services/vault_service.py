"""
MedTrustX Vault Shim Service — Business Logic Layer
"""
import uuid
import base64
import os
import secrets
import string
from typing import Optional, Dict, Any, Tuple

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from cryptography.fernet import Fernet
import structlog

from src.models.vault import VaultSecret, VaultRole, VaultTransitKey
from src.schemas.vault import SecretPutRequest, AuthLoginRequest, AuthLoginResponse
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# ── Auth ──

async def login(
    session: AsyncSession, tenant_id: uuid.UUID, data: AuthLoginRequest
) -> AuthLoginResponse:
    # Dummy AppRole verification for shim
    token = str(uuid.uuid4())
    return AuthLoginResponse(
        client_token=f"hvs.{token}",
        lease_duration=3600,
        policies=["default"]
    )

# ── Static Secrets ──

async def get_secret(
    session: AsyncSession, tenant_id: uuid.UUID, path: str
) -> Optional[VaultSecret]:
    result = await session.execute(
        select(VaultSecret).where(and_(VaultSecret.secret_path == path, VaultSecret.tenant_id == tenant_id, VaultSecret.deleted_at.is_(None)))
    )
    secret = result.scalar_one_or_none()
    if secret:
        await publish_event("SECRET_ACCESSED", tenant_id, secret.id, {"path": path})
    return secret

async def put_secret(
    session: AsyncSession, tenant_id: uuid.UUID, path: str, data: SecretPutRequest
) -> VaultSecret:
    secret = await get_secret(session, tenant_id, path)
    if secret:
        secret.secret_data = data.data
        secret.version += 1
    else:
        secret = VaultSecret(tenant_id=tenant_id, secret_path=path, secret_data=data.data)
        session.add(secret)
    await session.flush()
    await publish_event("SECRET_CREATED_OR_UPDATED", tenant_id, secret.id, {"path": path})
    return secret

# ── Dynamic Credentials ──

async def generate_db_creds(
    session: AsyncSession, tenant_id: uuid.UUID, role: str
) -> Tuple[str, str, int]:
    # Mock dynamic DB credential generation
    # In a real Vault, it connects to postgres and runs: CREATE USER "v-role-XYZ" WITH PASSWORD ...
    
    rand_suffix = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(8))
    username = f"v-{role}-{rand_suffix}"
    password = ''.join(secrets.choice(string.ascii_letters + string.digits + "!@#$%^&*") for _ in range(16))
    ttl = 3600
    
    await publish_event("DYNAMIC_CREDENTIAL_GENERATED", tenant_id, None, {"role": role, "username": username})
    return username, password, ttl

# ── Transit Encryption ──

async def _get_or_create_transit_key(
    session: AsyncSession, tenant_id: uuid.UUID, key_name: str
) -> VaultTransitKey:
    result = await session.execute(
        select(VaultTransitKey).where(and_(VaultTransitKey.key_name == key_name, VaultTransitKey.tenant_id == tenant_id, VaultTransitKey.deleted_at.is_(None)))
    )
    key = result.scalar_one_or_none()
    
    if not key:
        # Generate Fernet key (URL-safe base64-encoded 32-byte key)
        new_key = Fernet.generate_key()
        key = VaultTransitKey(tenant_id=tenant_id, key_name=key_name, key_material=new_key)
        session.add(key)
        await session.flush()
        await publish_event("KEY_CREATED", tenant_id, key.id, {"key_name": key_name})
        
    return key

async def transit_encrypt(
    session: AsyncSession, tenant_id: uuid.UUID, key_name: str, plaintext_b64: str
) -> str:
    key = await _get_or_create_transit_key(session, tenant_id, key_name)
    f = Fernet(key.key_material)
    
    # decode base64 plaintext input
    try:
        raw_pt = base64.b64decode(plaintext_b64)
    except Exception:
        raw_pt = plaintext_b64.encode("utf-8")
        
    token = f.encrypt(raw_pt)
    await publish_event("CRYPTOGRAPHIC_OPERATION", tenant_id, key.id, {"operation": "encrypt", "key_name": key_name})
    return f"vault:v{key.version}:{base64.b64encode(token).decode('utf-8')}"

async def transit_decrypt(
    session: AsyncSession, tenant_id: uuid.UUID, key_name: str, ciphertext: str
) -> str:
    key = await _get_or_create_transit_key(session, tenant_id, key_name)
    f = Fernet(key.key_material)
    
    try:
        # Strip "vault:vX:" prefix
        parts = ciphertext.split(":")
        if len(parts) == 3:
            actual_ct = parts[2]
        else:
            actual_ct = ciphertext
            
        raw_ct = base64.b64decode(actual_ct)
        pt = f.decrypt(raw_ct)
        
        await publish_event("CRYPTOGRAPHIC_OPERATION", tenant_id, key.id, {"operation": "decrypt", "key_name": key_name})
        return base64.b64encode(pt).decode('utf-8')
    except Exception as e:
        logger.error("decryption_failed", error=str(e))
        raise ValueError("Decryption failed")
