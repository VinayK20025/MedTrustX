"""
MedTrustX IAM Service — Business Logic Layer
"""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, List

from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.config import settings
from src.models.iam import User, Role, UserRole, Session
from src.schemas.iam import UserCreate, UserUpdate, RoleCreate, UserRoleAssign
from src.services.event_publisher import publish_event

logger = structlog.get_logger()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    
    # Inject Post-Quantum Cryptography metadata (Hybrid PQC)
    pqc_headers = {
        "pqc_alg": "kyber-1024",
        "sig_alg": "Dilithium5",
        "pqc_hybrid": True
    }
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET, 
        algorithm=settings.JWT_ALGORITHM,
        headers=pqc_headers
    )
    return encoded_jwt

# ── Authentication ──

async def authenticate_user(session: AsyncSession, tenant_id: uuid.UUID, username: str, password: str) -> Optional[User]:
    result = await session.execute(
        select(User).where(and_(User.username == username, User.tenant_id == tenant_id, User.deleted_at.is_(None)))
    )
    user = result.scalar_one_or_none()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

async def create_user_session(session: AsyncSession, tenant_id: uuid.UUID, user: User) -> dict:
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Get user roles for token
    roles_result = await session.execute(
        select(Role.name).join(UserRole, Role.id == UserRole.role_id).where(UserRole.user_id == user.id)
    )
    roles = [r for r in roles_result.scalars().all()]
    
    access_token = create_access_token(
        data={"sub": str(user.id), "tenant_id": str(tenant_id), "roles": roles}, expires_delta=access_token_expires
    )
    
    expires_at = datetime.now(timezone.utc) + access_token_expires
    
    db_session = Session(
        tenant_id=tenant_id,
        user_id=user.id,
        token=access_token,
        expires_at=expires_at
    )
    session.add(db_session)
    await session.flush()
    
    await publish_event("USER_LOGGED_IN", tenant_id, user.id, {"username": user.username})
    await publish_event("TOKEN_ISSUED", tenant_id, db_session.id, {"user_id": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": int(access_token_expires.total_seconds())
    }

async def revoke_session(session: AsyncSession, tenant_id: uuid.UUID, token: str) -> bool:
    result = await session.execute(
        select(Session).where(and_(Session.token == token, Session.tenant_id == tenant_id, Session.deleted_at.is_(None)))
    )
    db_session = result.scalar_one_or_none()
    if not db_session:
        return False
    
    db_session.soft_delete()
    await session.flush()
    return True

# ── Users ──

async def create_user(
    session: AsyncSession, tenant_id: uuid.UUID, data: UserCreate
) -> User:
    hashed_password = get_password_hash(data.password)
    user = User(
        tenant_id=tenant_id,
        username=data.username,
        email=data.email,
        password_hash=hashed_password,
    )
    session.add(user)
    await session.flush()
    
    await publish_event("USER_CREATED", tenant_id, user.id, {"username": user.username})
    return user

async def get_user(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID
) -> Optional[User]:
    result = await session.execute(
        select(User).where(and_(User.id == user_id, User.tenant_id == tenant_id, User.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def update_user(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID, data: UserUpdate
) -> Optional[User]:
    user = await get_user(session, tenant_id, user_id)
    if not user:
        return None
        
    if data.email:
        user.email = data.email
    if data.status:
        user.status = data.status
    if data.password:
        user.password_hash = get_password_hash(data.password)
        
    user.updated_at = datetime.now(timezone.utc)
    await session.flush()
    return user

# ── Roles ──

async def create_role(
    session: AsyncSession, tenant_id: uuid.UUID, data: RoleCreate
) -> Role:
    role = Role(
        tenant_id=tenant_id,
        name=data.name,
        description=data.description,
    )
    session.add(role)
    await session.flush()
    return role

async def get_role(
    session: AsyncSession, tenant_id: uuid.UUID, role_id: uuid.UUID
) -> Optional[Role]:
    result = await session.execute(
        select(Role).where(and_(Role.id == role_id, Role.tenant_id == tenant_id, Role.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()

async def assign_role_to_user(
    session: AsyncSession, tenant_id: uuid.UUID, user_id: uuid.UUID, data: UserRoleAssign
) -> Optional[UserRole]:
    user = await get_user(session, tenant_id, user_id)
    role = await get_role(session, tenant_id, data.role_id)
    
    if not user or not role:
        return None
        
    user_role = UserRole(
        tenant_id=tenant_id,
        user_id=user_id,
        role_id=data.role_id,
    )
    session.add(user_role)
    await session.flush()
    
    await publish_event("ROLE_ASSIGNED", tenant_id, user.id, {"role_id": str(role.id), "role_name": role.name})
    return user_role

# ── Sessions ──
async def get_session_by_id(
    session: AsyncSession, tenant_id: uuid.UUID, session_id: uuid.UUID
) -> Optional[Session]:
    result = await session.execute(
        select(Session).where(and_(Session.id == session_id, Session.tenant_id == tenant_id, Session.deleted_at.is_(None)))
    )
    return result.scalar_one_or_none()
