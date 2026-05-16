"""
User Provisioner Service.
"""
from typing import Dict, Any, Optional
from uuid import UUID
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from passlib.hash import argon2
from opentelemetry import trace

from app.db.repositories.user_repo import UserRepository
from app.db.repositories.role_repo import RoleRepository
from app.services.keycloak_sync import KeycloakSyncService

tracer = trace.get_tracer(__name__)

class UserProvisioner:
    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepository(session)
        self.role_repo = RoleRepository(session)
        self.keycloak_sync = KeycloakSyncService()

    async def provision_user(self, username: str, email: str, first_name: str, last_name: str, 
                             role_name: str, department: str, tenant_id: UUID) -> Dict[str, Any]:
        with tracer.start_as_current_span("iam.user.provision"):
            user_id = uuid.uuid4()
            
            dummy_password = "TemporaryPassword123!"
            password_hash = argon2.hash(dummy_password)
            
            metadata = {
                "first_name": first_name,
                "last_name": last_name,
                "department": department
            }
            
            await self.user_repo.create_user(user_id, username, email, password_hash, tenant_id, metadata)
            
            role = await self.role_repo.get_role_by_name(role_name)
            if role:
                await self.role_repo.assign_role(user_id, role["id"], tenant_id, user_id)
                
            await self.keycloak_sync.sync_user(str(user_id), username, email, first_name, last_name, role_name, str(tenant_id))
            
            return {
                "id": str(user_id),
                "username": username,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "status": "active",
                "tenant_id": str(tenant_id)
            }
