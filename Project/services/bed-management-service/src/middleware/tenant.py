"""Tenant isolation middleware — extracts tenant_id from JWT/header."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import structlog

logger = structlog.get_logger()


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        tenant_id = request.headers.get("X-Tenant-ID")

        if not tenant_id:
            tenant_id = getattr(request.state, "jwt_claims", {}).get("tenant_id")

        if not tenant_id:
            tenant_id = "tenant_apollo"  # Default for development

        request.state.tenant_id = tenant_id
        logger.debug("tenant_resolved", tenant_id=tenant_id, path=request.url.path)

        response = await call_next(request)
        response.headers["X-Tenant-ID"] = tenant_id
        return response
