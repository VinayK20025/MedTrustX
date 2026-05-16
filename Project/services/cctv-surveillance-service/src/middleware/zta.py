"""ZTA middleware — calls OPA for policy decision on every request."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import httpx, structlog
from src.config import settings
logger = structlog.get_logger()

_RESOURCE_MAP = {"/cameras": "cctv_cameras", "/streams": "cctv_streams", "/recordings": "cctv_recordings", "/events": "cctv_events"}

def _resolve_resource(path: str) -> str:
    for p, r in _RESOURCE_MAP.items():
        if p in path:
            return r
    return "cctv_resource"

class ZTAMiddleware(BaseHTTPMiddleware):
    SKIP_PATHS = {"/health", "/ready", "/metrics", "/docs", "/redoc", "/openapi.json"}
    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)
        opa_input = {"input": {"role": request.headers.get("X-User-Role", "anonymous"), "action": self._method_to_action(request.method), "resource": _resolve_resource(request.url.path), "user_tenant_id": getattr(request.state, "tenant_id", ""), "resource_tenant_id": getattr(request.state, "tenant_id", ""), "ip_trusted": True, "device_compliant": request.headers.get("X-Device-Compliant", "true") == "true", "device_registered": request.headers.get("X-Device-Registered", "true") == "true", "device_trust_score": float(request.headers.get("X-Device-Trust-Score", "0.8")), "mfa_verified": request.headers.get("X-MFA-Verified", "false") == "true", "session_active": True, "token_expired": False, "anomaly_score": 0.1, "geo_allowed": True, "emergency": request.headers.get("X-Emergency", "false") == "true"}}
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.post(f"{settings.OPA_URL}/v1/data/medtrust/authz/zta/decision", json=opa_input)
                decision = resp.json().get("result", {})
                if not decision.get("allow", False):
                    reason = decision.get("reason", "access_denied")
                    if decision.get("action") == "mfa":
                        return JSONResponse(status_code=403, content={"error": "step_up_required", "message": "MFA verification required"})
                    return JSONResponse(status_code=403, content={"error": "access_denied", "reason": reason})
        except Exception as e:
            logger.error("opa_unreachable", error=str(e))
            if settings.ENVIRONMENT != "development":
                return JSONResponse(status_code=503, content={"error": "policy_engine_unavailable"})
        return await call_next(request)

    @staticmethod
    def _method_to_action(method: str) -> str:
        return {"GET": "read", "POST": "write", "PUT": "update", "PATCH": "update", "DELETE": "delete"}.get(method, "read")
