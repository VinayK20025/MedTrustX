"""Tenant isolation middleware — extracts tenant_id from JWT/header."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import structlog

logger = structlog.get_logger()

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Realms in keycloak map to tenants. If realm is in URL, extract it.
        tenant_id = "tenant_apollo" # default
        
        path_parts = request.url.path.split("/")
        if "realms" in path_parts:
            idx = path_parts.index("realms")
            if len(path_parts) > idx + 1:
                tenant_id = path_parts[idx + 1]
                
        request.state.tenant_id = tenant_id
        logger.debug("tenant_resolved", tenant_id=tenant_id, path=request.url.path)
        response = await call_next(request)
        response.headers["X-Tenant-ID"] = tenant_id
        return response
