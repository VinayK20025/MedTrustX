"""ZTA middleware — enforces MFA for break-glass endpoints."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import httpx, structlog
from src.config import settings
logger = structlog.get_logger()

class ZTAMiddleware(BaseHTTPMiddleware):
    SKIP_PATHS = {"/health", "/ready", "/metrics", "/docs", "/redoc", "/openapi.json"}
    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)
        opa_input = {"input": {"role": request.headers.get("X-User-Role", "anonymous"), "action": self._method_to_action(request.method), "resource": "break_glass", "user_tenant_id": getattr(request.state, "tenant_id", ""), "resource_tenant_id": getattr(request.state, "tenant_id", ""), "mfa_verified": request.headers.get("X-MFA-Verified", "false") == "true", "device_compliant": request.headers.get("X-Device-Compliant", "false") == "true", "session_active": True, "token_expired": False, "emergency": request.headers.get("X-Emergency", "true") == "true"}}
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.post(f"{settings.OPA_URL}/v1/data/medtrust/authz/zta/decision", json=opa_input)
                decision = resp.json().get("result", {})
                if not decision.get("allow", False):
                    if decision.get("action") == "mfa":
                        return JSONResponse(status_code=403, content={"error": "step_up_required", "message": "MFA verification required for break-glass access"})
                    return JSONResponse(status_code=403, content={"error": "access_denied", "reason": decision.get("reason", "policy_denied")})
        except Exception as e:
            logger.error("opa_unreachable", error=str(e))
            if settings.ENVIRONMENT != "development":
                return JSONResponse(status_code=503, content={"error": "policy_engine_unavailable"})
        return await call_next(request)

    @staticmethod
    def _method_to_action(method: str) -> str:
        return {"GET": "read", "POST": "write", "PUT": "update", "DELETE": "delete"}.get(method, "read")
