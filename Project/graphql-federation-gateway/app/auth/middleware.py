"""
Auth Context Middleware.
"""
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from fastapi import Request
from fastapi.responses import JSONResponse

from app.auth.pqc_jwt import validate_pqc_jwt
from app.config import settings
from app.observability.logging import get_logger

logger = get_logger(__name__)

class GraphQLAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        if request.url.path in ["/health", "/metrics", "/graphql"]:
            pass
            
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            request.state.user = None
            return await call_next(request)
            
        try:
            token = auth_header.split(" ")[1]
            pqc_key = request.headers.get(settings.pqc_session_header)
            
            payload = await validate_pqc_jwt(token, pqc_key)
            request.state.user = {
                "tenant_id": payload.get("tenant_id"),
                "sub": payload.get("sub"),
                "roles": payload.get("realm_access", {}).get("roles", []),
                "token": token
            }
        except Exception as e:
            logger.warning("GraphQL auth failed: %s", str(e))
            return JSONResponse(status_code=401, content={"detail": str(e)})
            
        return await call_next(request)

async def get_context(request: Request):
    return {"request": request, "user": getattr(request.state, "user", None)}
