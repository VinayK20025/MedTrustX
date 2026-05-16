"""ZTA middleware — calls OPA for policy decision on every request.

Resource mapping for Facilities service:
  - facility              → Building/campus CRUD
  - room                  → Room management within facilities
  - asset                 → Non-consumable physical asset tracking
  - maintenance_request   → Reactive break-fix tickets
  - maintenance_schedule  → Proactive preventive maintenance
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import httpx
import structlog

from src.config import settings

logger = structlog.get_logger()

# ── Route → OPA resource mapping ───────────────────────────────
_RESOURCE_MAP = {
    "/facilities": "facility",
    "/rooms": "room",
    "/assets": "asset",
    "/maintenance/requests": "maintenance_request",
    "/maintenance/schedules": "maintenance_schedule",
}


def _resolve_resource(path: str) -> str:
    """Map request path to an OPA resource name."""
    for pattern, resource in _RESOURCE_MAP.items():
        if pattern in path:
            return resource
    return "facility_resource"


class ZTAMiddleware(BaseHTTPMiddleware):
    # Paths that skip ZTA checks
    SKIP_PATHS = {"/health", "/ready", "/metrics", "/docs", "/redoc", "/openapi.json"}

    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)

        # Build OPA input with full zero-trust signal context
        opa_input = {
            "input": {
                "role": request.headers.get("X-User-Role", "anonymous"),
                "action": self._method_to_action(request.method),
                "resource": _resolve_resource(request.url.path),
                "user_tenant_id": getattr(request.state, "tenant_id", ""),
                "resource_tenant_id": getattr(request.state, "tenant_id", ""),
                "ip_trusted": True,
                "device_compliant": request.headers.get("X-Device-Compliant", "true") == "true",
                "device_registered": request.headers.get("X-Device-Registered", "true") == "true",
                "device_trust_score": float(request.headers.get("X-Device-Trust-Score", "0.8")),
                "mfa_verified": request.headers.get("X-MFA-Verified", "false") == "true",
                "session_active": True,
                "token_expired": False,
                "anomaly_score": 0.1,
                "geo_allowed": True,
                "emergency": request.headers.get("X-Emergency", "false") == "true",
            }
        }

        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.post(
                    f"{settings.OPA_URL}/v1/data/medtrust/authz/zta/decision",
                    json=opa_input
                )
                decision = resp.json().get("result", {})

                if not decision.get("allow", False):
                    reason = decision.get("reason", "access_denied")
                    logger.warning("zta_denied", reason=reason, path=request.url.path)

                    if decision.get("action") == "mfa":
                        return JSONResponse(status_code=403, content={
                            "error": "step_up_required",
                            "message": "MFA verification required",
                        })

                    return JSONResponse(status_code=403, content={
                        "error": "access_denied",
                        "reason": reason,
                    })

        except Exception as e:
            logger.error("opa_unreachable", error=str(e))
            # Fail-open in dev, fail-closed in production
            if settings.ENVIRONMENT != "development":
                return JSONResponse(status_code=503, content={
                    "error": "policy_engine_unavailable"
                })

        return await call_next(request)

    @staticmethod
    def _method_to_action(method: str) -> str:
        return {
            "GET": "read", "POST": "write", "PUT": "update",
            "PATCH": "update", "DELETE": "delete",
        }.get(method, "read")
