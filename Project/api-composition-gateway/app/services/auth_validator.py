"""
Triple Auth Validator.
"""
import httpx
from fastapi import HTTPException
from app.auth.pqc_jwt import validate_pqc_jwt
from app.auth.oauth2_introspection import OAuth2Introspector
from app.config import settings
from app.observability.metrics import auth_validation_latency_seconds, auth_failures_total

class TripleAuthValidator:
    def __init__(self):
        self.introspector = OAuth2Introspector()

    async def validate(self, token: str, pqc_key: str, resource: str, action: str) -> dict:
        import time
        start = time.time()
        
        try:
            payload = await validate_pqc_jwt(token, pqc_key)
            
            tenant_id = payload.get("tenant_id", "default")
            user_id = payload.get("sub")
            roles = payload.get("realm_access", {}).get("roles", [])
            
            intro_data = await self.introspector.introspect(token)
            if not intro_data.get("active"):
                auth_failures_total.labels(reason="introspection_failed").inc()
                raise HTTPException(status_code=401, detail="Token inactive or expired")
                
            async with httpx.AsyncClient(timeout=2.0) as client:
                opa_input = {
                    "input": {
                        "user_id": user_id,
                        "role": roles[0] if roles else "guest",
                        "resource": resource,
                        "action": action,
                        "tenant_id": tenant_id
                    }
                }
                try:
                    res = await client.post(f"{settings.opa_url}/v1/data/medtrust/authz/allow", json=opa_input)
                    if res.status_code == 200:
                        allowed = res.json().get("result", False)
                        if not allowed:
                            auth_failures_total.labels(reason="opa_denied").inc()
                            raise HTTPException(status_code=403, detail="OPA authorization denied")
                except httpx.RequestError:
                    pass
            
            auth_validation_latency_seconds.labels(method="triple_auth").observe(time.time() - start)
            
            return {
                "tenant_id": tenant_id,
                "sub": user_id,
                "roles": roles
            }
        except Exception as e:
            if not isinstance(e, HTTPException):
                auth_failures_total.labels(reason="validation_error").inc()
                raise HTTPException(status_code=401, detail=str(e))
            raise e
