"""
Session Manager Service.
"""
from typing import Dict, Any, Optional
from uuid import UUID
import uuid
from datetime import datetime, timezone, timedelta
import json
import httpx

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from opentelemetry import trace

from app.db.repositories.session_repo import SessionRepository
from app.db.repositories.user_repo import UserRepository
from app.db.repositories.role_repo import RoleRepository
from app.auth.pqc_jwt import create_pqc_jwt
from app.config import settings

tracer = trace.get_tracer(__name__)

class SessionManager:
    def __init__(self, session: AsyncSession, redis: Redis):
        self.session_repo = SessionRepository(session)
        self.user_repo = UserRepository(session)
        self.role_repo = RoleRepository(session)
        self.redis = redis

    async def create_session(self, user_id: UUID, device_id: UUID, mfa_method: str, ip_address: str) -> Dict[str, Any]:
        with tracer.start_as_current_span("iam.session.create"):
            user = await self.user_repo.get_user_by_id(user_id)
            if not user or user["status"] != "active":
                raise ValueError("Invalid or inactive user")

            roles = await self.role_repo.get_user_roles(user_id)
            role_names = [r["name"] for r in roles]
            tenant_id = user["tenant_id"]

            async with httpx.AsyncClient() as client:
                try:
                    response = await client.post(
                        f"{settings.zta_service_url}/api/zta/access/evaluate",
                        json={
                            "user_id": str(user_id),
                            "device_id": str(device_id),
                            "resource": "login",
                            "action": "create_session",
                            "tenant_id": str(tenant_id),
                            "source_ip": ip_address
                        },
                        timeout=5.0
                    )
                    if response.status_code == 200:
                        zta_decision = response.json()
                        if not zta_decision.get("allow"):
                            raise ValueError("ZTA evaluation denied access")
                        trust_score = zta_decision.get("trust_score", 0.0)
                    else:
                        raise ValueError("ZTA evaluation failed")
                except Exception as e:
                    raise ValueError(f"ZTA Service unavailable: {str(e)}")

            session_id = uuid.uuid4()
            expires_at = datetime.now(timezone.utc) + timedelta(hours=12)
            
            await self.session_repo.create_session(
                session_id, user_id, device_id, tenant_id, 
                mfa_method, ip_address, expires_at.isoformat()
            )

            token_claims = {
                "sub": str(user_id),
                "tenant_id": str(tenant_id),
                "roles": role_names,
                "device_id": str(device_id),
                "trust_score": trust_score,
                "session_id": str(session_id)
            }
            
            access_token = create_pqc_jwt(token_claims)
            refresh_token = str(uuid.uuid4())
            await self.redis.setex(f"medtrust:iam:refresh:{refresh_token}", 43200, str(session_id))

            await self.redis.publish("medtrust:iam:sessions", json.dumps({
                "event": "session_created",
                "session_id": str(session_id),
                "user_id": str(user_id),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }))

            return {
                "session_id": session_id,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "expires_at": expires_at
            }

    async def revoke_session(self, session_id: UUID) -> None:
        await self.session_repo.revoke_session(session_id)
        await self.redis.setex(f"medtrust:iam:blacklist:session:{session_id}", 43200, "revoked")
        await self.redis.publish("medtrust:iam:sessions", json.dumps({
            "event": "session_revoked",
            "session_id": str(session_id),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }))
