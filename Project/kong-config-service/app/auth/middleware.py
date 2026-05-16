"""
Auth Middleware.
"""
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.auth.pqc_jwt import validate_pqc_jwt
from app.config import settings

class PQCAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        if not request.url.path.startswith("/api/"):
            return await call_next(request)
        if request.url.path.startswith("/api/docs") or request.url.path.startswith("/api/openapi"):
            return await call_next(request)
            
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Missing or invalid Authorization header"})
            
        token = auth_header.split(" ")[1]
        pqc_key = request.headers.get(settings.pqc_session_header)
        
        try:
            payload = await validate_pqc_jwt(token, pqc_key)
            request.state.tenant_id = payload.get("tenant_id")
            request.state.user_id = payload.get("sub")
            realm_access = payload.get("realm_access", {})
            request.state.roles = realm_access.get("roles", [])
            if not request.state.roles and "roles" in payload:
                request.state.roles = payload["roles"]
            request.state.session_id = payload.get("session_id")
        except Exception as e:
            return JSONResponse(status_code=401, content={"detail": str(e)})
            
        return await call_next(request)
