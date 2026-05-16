"""
Keycloak Sync Service.
"""
from typing import Dict, Any
import httpx
from opentelemetry import trace
import logging

from app.config import settings

tracer = trace.get_tracer(__name__)
logger = logging.getLogger(__name__)

class KeycloakSyncService:
    def __init__(self):
        self.base_url = settings.keycloak_url
        self.realm = settings.keycloak_realm
        self.admin_user = settings.keycloak_admin_user
        self.admin_pass = settings.keycloak_admin_pass
        self._token = None

    async def _get_token(self) -> str:
        if self._token:
            return self._token
            
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/realms/master/protocol/openid-connect/token",
                    data={
                        "client_id": "admin-cli",
                        "username": self.admin_user,
                        "password": self.admin_pass,
                        "grant_type": "password"
                    }
                )
                if response.status_code == 200:
                    self._token = response.json().get("access_token")
                    return self._token
            except Exception as e:
                logger.error(f"Failed to get Keycloak token: {str(e)}")
        return ""

    async def sync_user(self, user_id: str, username: str, email: str, first_name: str, last_name: str, role_name: str, tenant_id: str) -> None:
        with tracer.start_as_current_span("iam.scim.sync"):
            token = await self._get_token()
            if not token:
                logger.warning("Skipping Keycloak sync due to missing token")
                return
                
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            payload = {
                "username": username,
                "email": email,
                "firstName": first_name,
                "lastName": last_name,
                "enabled": True,
                "attributes": {
                    "tenant_id": [tenant_id]
                }
            }
            
            async with httpx.AsyncClient() as client:
                try:
                    res = await client.post(
                        f"{self.base_url}/admin/realms/{self.realm}/users",
                        json=payload,
                        headers=headers
                    )
                    if res.status_code not in (201, 409):
                        logger.error(f"Failed to sync user to Keycloak: {res.text}")
                except Exception as e:
                    logger.error(f"Error syncing user to Keycloak: {str(e)}")
