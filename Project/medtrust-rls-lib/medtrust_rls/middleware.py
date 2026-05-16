"""
FastAPI Middleware for RLS context.
"""
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from fastapi import Request
from fastapi.responses import JSONResponse

class RLSContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        tenant_id = getattr(request.state, "tenant_id", None)
        response = await call_next(request)
        return response
