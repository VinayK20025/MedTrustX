"""
Auth Middleware using Auth Validator.
"""
import time
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.services.auth_validator import TripleAuthValidator
from app.config import settings
from app.observability.logging import get_logger

logger = get_logger(__name__)

class TripleAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.validator = TripleAuthValidator()

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        if request.url.path.startswith("/health") or request.url.path.startswith("/metrics"):
            return await call_next(request)
            
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Missing or invalid Authorization header"})
            
        token = auth_header.split(" ")[1]
        pqc_key = request.headers.get(settings.pqc_session_header)
        
        path = request.url.path
        method = request.method
        
        start_time = time.time()
        try:
            payload = await self.validator.validate(token, pqc_key, resource=path, action=method)
            request.state.tenant_id = payload.get("tenant_id")
            request.state.user_id = payload.get("sub")
            request.state.roles = payload.get("roles", [])
            request.state.token = token
        except Exception as e:
            logger.warning("Auth validation failed: %s", str(e))
            from fastapi import HTTPException
            status_code = 401
            if isinstance(e, HTTPException):
                status_code = e.status_code
            return JSONResponse(status_code=status_code, content={"detail": str(e)})
            
        duration = time.time() - start_time
        logger.info("Auth validation took %.2fms", duration * 1000)
        
        return await call_next(request)
