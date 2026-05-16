"""Tenant isolation middleware."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        tenant_id = request.headers.get("X-Tenant-ID", "tenant_apollo")
        request.state.tenant_id = tenant_id
        response = await call_next(request)
        response.headers["X-Tenant-ID"] = tenant_id
        return response
