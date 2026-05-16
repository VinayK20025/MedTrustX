"""
app/dependencies.py
====================
Shared FastAPI dependency functions for the MedTrustX AI Platform Service.

Provides:
  - get_db_for_request()  — tenant-isolated AsyncSession from JWT claims
  - verify_tenant_match() — enforce JWT tenant_id == body tenant_id
  - require_role()        — role-based access control dependency factory
  - problem_detail()      — RFC 7807 Problem Details dict builder
  - get_current_user()    — extracts claims from request.state
"""

from __future__ import annotations

from typing import Any, AsyncGenerator

from fastapi import HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db as _get_db
from app.observability.tracing import get_current_trace_id


# ─── RFC 7807 Problem Details builder ─────────────────────────────────────────

def problem_detail(
    status: int,
    title: str,
    detail: str,
    instance: str,
    type_suffix: str | None = None,
    **extra: Any,
) -> dict[str, Any]:
    """
    Build an RFC 7807 Problem Details dict.

    Args:
        status:      HTTP status code.
        title:       Short problem title.
        detail:      Human-readable detail (no stack traces).
        instance:    Request URI.
        type_suffix: Appended to the MedTrustX error type URI.
        **extra:     Additional fields to include.

    Returns:
        Dict suitable for use as HTTPException detail.
    """
    suffix = type_suffix or title.lower().replace(" ", "-")
    body: dict[str, Any] = {
        "type": f"https://medtrustx.hospital/errors/{suffix}",
        "title": title,
        "status": status,
        "detail": detail,
        "instance": instance,
        "trace_id": get_current_trace_id(),
    }
    body.update(extra)
    return body


# ─── Current user extraction ───────────────────────────────────────────────────

def get_current_user(request: Request) -> dict[str, Any]:
    """
    Extract the validated JWT claims stored on request.state by the middleware.

    Returns:
        Dict with tenant_id, user_id, roles, jwt_payload.

    Raises:
        HTTPException 401 if auth middleware did not populate request.state.
    """
    tenant_id = getattr(request.state, "tenant_id", None)
    user_id = getattr(request.state, "user_id", None)
    roles = getattr(request.state, "roles", None)

    if tenant_id is None or user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=problem_detail(
                status=401,
                title="Unauthorized",
                detail="Authentication required. No validated token found in request state.",
                instance=str(request.url.path),
            ),
            headers={"WWW-Authenticate": 'Bearer realm="medtrustx-ai-platform"'},
        )

    return {
        "tenant_id": tenant_id,
        "user_id": user_id,
        "roles": roles or [],
        "jwt_payload": getattr(request.state, "jwt_payload", {}),
    }


# ─── Tenant isolation enforcement ─────────────────────────────────────────────

def verify_tenant_match(request: Request, body_tenant_id: str) -> None:
    """
    Verify that the tenant_id in the request body matches the JWT claim.

    This is the multi-tenant isolation gate — it prevents a token issued for
    ``tenant_apollo`` from accessing ``tenant_medanta`` data.

    Args:
        request:        The FastAPI request (JWT claims on request.state).
        body_tenant_id: Tenant ID from the request body or query param.

    Raises:
        HTTPException 403 if tenant IDs do not match.
    """
    jwt_tenant = getattr(request.state, "tenant_id", None)
    if jwt_tenant is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=problem_detail(
                status=401,
                title="Unauthorized",
                detail="No tenant context found in JWT.",
                instance=str(request.url.path),
            ),
        )

    if jwt_tenant != body_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=problem_detail(
                status=403,
                title="Tenant Mismatch",
                detail=(
                    f"JWT tenant '{jwt_tenant}' does not match "
                    f"request tenant '{body_tenant_id}'. "
                    "Cross-tenant data access is not permitted."
                ),
                instance=str(request.url.path),
                type_suffix="tenant-mismatch",
            ),
        )


# ─── Database dependency with tenant isolation ────────────────────────────────

async def get_db_for_request(
    request: Request,
) -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields a tenant-isolated AsyncSession.

    The tenant_id is extracted from the authenticated JWT stored on
    request.state by PQCAuthMiddleware.

    Usage in a router::

        @router.post("/example")
        async def handler(
            db: AsyncSession = Depends(get_db_for_request),
            ...
        ):
            ...

    Yields:
        An ``AsyncSession`` with RLS already activated for the JWT tenant.
    """
    user = get_current_user(request)
    tenant_id = user["tenant_id"]

    async for session in _get_db(tenant_id=tenant_id):
        yield session


# ─── Role-based access control ────────────────────────────────────────────────

def require_role(*required_roles: str):
    """
    FastAPI dependency factory that enforces role-based access control.

    Args:
        *required_roles: One or more role strings. The request is allowed if
                         the JWT contains ANY of the required roles.

    Returns:
        A FastAPI dependency function.

    Example::

        @router.get("/admin-only")
        async def admin_endpoint(
            _: None = Depends(require_role("ai-admin", "ml-engineer")),
        ):
            ...
    """
    async def _check_role(request: Request) -> None:
        user = get_current_user(request)
        user_roles: list[str] = user.get("roles", [])

        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=problem_detail(
                    status=403,
                    title="Insufficient Role",
                    detail=(
                        f"This endpoint requires one of the following roles: "
                        f"{list(required_roles)}. "
                        f"Your roles: {user_roles}."
                    ),
                    instance=str(request.url.path),
                    type_suffix="insufficient-role",
                ),
            )

    return _check_role
