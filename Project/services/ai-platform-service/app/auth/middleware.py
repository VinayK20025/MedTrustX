"""
app/auth/middleware.py
=======================
FastAPI authentication middleware for the MedTrustX AI Platform Service.

Behaviour
─────────
  1. All requests to protected paths are intercepted before reaching route handlers.
  2. The ``Authorization: Bearer <token>`` header is extracted and validated using
     the PQC+RS256 hybrid validator in ``pqc_jwt.py``.
  3. On success, the validated claims (tenant_id, user_id, roles) are stored on
     ``request.state`` for downstream use in route handlers and dependencies.
  4. The per-request logging context is updated with tenant_id and trace_id.
  5. On failure, an RFC 7807 Problem Details JSON response is returned immediately
     with the appropriate ``WWW-Authenticate`` header.

Exempt paths (no auth required):
  /health, /metrics, /docs, /redoc, /openapi.json

Role enforcement:
  Route-level role checks are performed in ``app/dependencies.py`` using
  the ``require_role()`` dependency — middleware only validates the token.
"""

from __future__ import annotations

import time
from typing import Any

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp

from app.auth.pqc_jwt import validate_pqc_jwt
from app.config import settings
from app.observability.logging import LogContext, get_logger
from app.observability.tracing import get_current_trace_id

logger = get_logger(__name__)

# ─── Paths that bypass authentication ─────────────────────────────────────────
_EXEMPT_PREFIXES: tuple[str, ...] = (
    "/health",
    "/metrics",
    "/docs",
    "/redoc",
    "/openapi.json",
)


def _is_exempt(path: str) -> bool:
    """Return True if the request path does not require authentication."""
    return any(path.startswith(prefix) for prefix in _EXEMPT_PREFIXES)


def _problem_response(
    status: int,
    title: str,
    detail: str,
    path: str,
    type_suffix: str,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    """
    Build an RFC 7807 Problem Details JSON response.

    Args:
        status:      HTTP status code.
        title:       Short human-readable problem title.
        detail:      Detailed error message (no internal stack traces).
        path:        Request URI (used as ``instance``).
        type_suffix: Suffix appended to the MedTrustX error type URI.
        headers:     Optional additional response headers.

    Returns:
        A ``JSONResponse`` with ``Content-Type: application/problem+json``.
    """
    body: dict[str, Any] = {
        "type": f"https://medtrustx.hospital/errors/{type_suffix}",
        "title": title,
        "status": status,
        "detail": detail,
        "instance": path,
        "trace_id": get_current_trace_id(),
    }
    response_headers = {"Content-Type": "application/problem+json"}
    if headers:
        response_headers.update(headers)
    return JSONResponse(
        content=body,
        status_code=status,
        headers=response_headers,
    )


class PQCAuthMiddleware(BaseHTTPMiddleware):
    """
    Starlette middleware that validates PQC+RS256 JWT tokens on every
    protected HTTP request.

    The middleware is registered on the FastAPI ``app`` in ``main.py`` via::

        app.add_middleware(PQCAuthMiddleware)

    WebSocket connections are NOT handled here — they carry the token as a
    query parameter and are validated separately in the WebSocket router.
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        path = request.url.path

        # ── Pass through exempt paths immediately ──────────────────────────
        if _is_exempt(path):
            return await call_next(request)

        # ── WebSocket upgrade requests are handled by the WS router ───────
        if request.headers.get("upgrade", "").lower() == "websocket":
            return await call_next(request)

        # ── Extract Bearer token ────────────────────────────────────────────
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            logger.warning(
                "Request missing Bearer token",
                extra={"path": path, "method": request.method},
            )
            return _problem_response(
                status=401,
                title="Unauthorized",
                detail="Authorization header must be 'Bearer <token>'.",
                path=path,
                type_suffix="unauthorized",
                headers={
                    "WWW-Authenticate": (
                        'Bearer realm="medtrustx-ai-platform",'
                        ' error="invalid_request"'
                    )
                },
            )

        token = auth_header[len("Bearer "):]
        pqc_header = request.headers.get(settings.pqc_session_header)

        # ── Validate PQC+JWT ────────────────────────────────────────────────
        start = time.perf_counter()
        try:
            claims = await validate_pqc_jwt(
                token=token,
                pqc_session_header=pqc_header,
            )
        except PermissionError as exc:
            # PQC decapsulation failed
            logger.warning(
                "PQC authentication failed",
                extra={"path": path, "error": str(exc)},
            )
            return _problem_response(
                status=401,
                title="PQC Authentication Failed",
                detail=str(exc),
                path=path,
                type_suffix="pqc-auth-failed",
                headers={
                    "WWW-Authenticate": (
                        'Bearer realm="medtrustx-ai-platform",'
                        ' error="invalid_token",'
                        ' error_description="PQC session key verification failed"'
                    )
                },
            )
        except ValueError as exc:
            # JWT validation error (expired, bad signature, missing claims)
            logger.warning(
                "JWT validation failed",
                extra={"path": path, "error": str(exc)},
            )
            return _problem_response(
                status=401,
                title="Invalid Token",
                detail=str(exc),
                path=path,
                type_suffix="invalid-token",
                headers={
                    "WWW-Authenticate": (
                        'Bearer realm="medtrustx-ai-platform",'
                        ' error="invalid_token"'
                    )
                },
            )
        except Exception as exc:  # noqa: BLE001
            logger.error(
                "Unexpected auth error",
                extra={"path": path, "error": str(exc)},
            )
            return _problem_response(
                status=500,
                title="Authentication Service Error",
                detail="An internal error occurred during authentication.",
                path=path,
                type_suffix="auth-error",
            )

        auth_ms = (time.perf_counter() - start) * 1000

        # ── Attach claims to request state ─────────────────────────────────
        request.state.tenant_id = claims["tenant_id"]
        request.state.user_id = claims["user_id"]
        request.state.roles = claims["roles"]
        request.state.jwt_payload = claims["payload"]

        # ── Update per-request logging context ─────────────────────────────
        trace_id = get_current_trace_id()
        LogContext.set(
            tenant_id=claims["tenant_id"],
            patient_id=None,  # Set later in route handlers
            trace_id=trace_id,
        )

        logger.debug(
            "Auth middleware: token validated",
            extra={
                "user_id": claims["user_id"],
                "tenant_id": claims["tenant_id"],
                "roles": claims["roles"],
                "auth_latency_ms": round(auth_ms, 2),
            },
        )

        # ── Forward to the route handler ────────────────────────────────────
        response = await call_next(request)
        return response


async def authenticate_websocket_token(token: str) -> dict[str, Any]:
    """
    Validate a JWT token for a WebSocket connection.

    WebSocket connections pass the token as a query parameter:
        ``/ws/inference/stream?token=<jwt>``

    This function is called in the WebSocket router before accepting the
    connection.

    Args:
        token: Raw JWT string from the ``token`` query parameter.

    Returns:
        Claims dict: tenant_id, user_id, roles, payload.

    Raises:
        ValueError:      If the JWT is invalid or expired.
        PermissionError: If the PQC layer fails.
    """
    # WebSocket upgrades do not carry custom headers in many browser clients,
    # so PQC header validation is relaxed for WS connections.
    # The classical RS256 layer still provides strong security.
    return await validate_pqc_jwt(token=token, pqc_session_header=None)
