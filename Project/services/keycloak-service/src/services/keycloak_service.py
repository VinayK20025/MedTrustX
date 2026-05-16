"""
MedTrustX Keycloak Shim Service — Business Logic Layer
"""
import uuid
import time
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.hash import bcrypt
from jose import jwt
import structlog

from src.models.keycloak import KeycloakUser, KeycloakSession, KeycloakClient, KeycloakToken
from src.schemas.keycloak import UserCreate
from src.services.event_publisher import publish_event
from src.config import settings

logger = structlog.get_logger()

# ── Admin API ──

async def create_user(
    session: AsyncSession, tenant_id: uuid.UUID, data: UserCreate
) -> KeycloakUser:
    pw_hash = bcrypt.hash(data.password)
    user = KeycloakUser(
        tenant_id=tenant_id,
        username=data.username,
        email=data.email,
        password_hash=pw_hash,
        enabled=data.enabled
    )
    session.add(user)
    await session.flush()
    await publish_event("USER_REGISTERED", tenant_id, user.id, {"username": user.username})
    return user

async def get_user_by_username(
    session: AsyncSession, tenant_id: uuid.UUID, username: str
) -> Optional[KeycloakUser]:
    result = await session.execute(
        select(KeycloakUser).where(and_(KeycloakUser.username == username, KeycloakUser.tenant_id == tenant_id))
    )
    return result.scalar_one_or_none()

# ── OIDC Token API ──

async def issue_token(
    session: AsyncSession, tenant_id: uuid.UUID, user: KeycloakUser, client_id: str
) -> Dict[str, Any]:
    
    # 1. Create a session
    kc_session = KeycloakSession(
        tenant_id=tenant_id,
        user_id=user.id,
        session_state="active",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=10) # 10h max session
    )
    session.add(kc_session)
    await session.flush()
    
    # 2. Generate JWT
    now = int(time.time())
    expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    exp = now + expires_in
    
    claims = {
        "sub": str(user.id),
        "tenant_id": str(tenant_id),
        "preferred_username": user.username,
        "email": user.email,
        "session_state": str(kc_session.id),
        "azp": client_id,
        "iss": "https://keycloak.medtrustx.internal/auth/realms/" + str(tenant_id),
        "aud": "account",
        "typ": "Bearer",
        "iat": now,
        "exp": exp,
        "roles": ["user"] # Simplified for shim
    }
    
    access_token = jwt.encode(claims, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    refresh_token = str(uuid.uuid4()) # Dummy refresh token for shim
    
    # 3. Store Token Ref
    kc_token = KeycloakToken(
        tenant_id=tenant_id,
        user_id=user.id,
        token=access_token,
        expires_at=datetime.fromtimestamp(exp, tz=timezone.utc)
    )
    session.add(kc_token)
    await session.flush()
    
    await publish_event("USER_LOGGED_IN", tenant_id, user.id, {"client_id": client_id, "session_id": str(kc_session.id)})
    await publish_event("TOKEN_ISSUED", tenant_id, user.id, {"client_id": client_id})
    
    return {
        "access_token": access_token,
        "expires_in": expires_in,
        "refresh_expires_in": 36000,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
        "not_before_policy": 0,
        "session_state": str(kc_session.id),
        "scope": "openid profile email"
    }

async def authenticate_user(
    session: AsyncSession, tenant_id: uuid.UUID, username: str, password: str
) -> Optional[KeycloakUser]:
    user = await get_user_by_username(session, tenant_id, username)
    if not user or not user.enabled:
        return None
        
    if not bcrypt.verify(password, user.password_hash):
        return None
        
    return user
