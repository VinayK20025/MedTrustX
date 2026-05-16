"""
MedTrustX Internal API Gateway — Proxy Route
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.services.proxy_service import forward_request

# We do not use a prefix here because it intercepts everything
router = APIRouter(tags=["Proxy"])

def _get_tenant_id(request: Request) -> uuid.UUID:
    raw = getattr(request.state, "tenant_id", None)
    if raw is None:
        raise HTTPException(status_code=400, detail="Missing tenant context")
    try:
        return uuid.UUID(str(raw))
    except ValueError:
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(raw))

@router.api_route(
    "/{target_path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
    summary="Catch-all Reverse Proxy",
    include_in_schema=False,
)
async def proxy_request(
    target_path: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    # Prevent infinite proxy loops if someone hits the management API via proxy
    if target_path.startswith("api/v1/gateway") or target_path.startswith("gateway"):
        raise HTTPException(status_code=400, detail="Cannot proxy to internal gateway admin routes")

    tenant_id = _get_tenant_id(request)

    # 1. Forward the Request
    status_code, content, response_headers = await forward_request(
        request, target_path, session, tenant_id
    )

    # 2. Commit audit logs
    await session.commit()

    # 3. Construct response
    # Filter out headers that shouldn't be proxied back
    excluded_headers = {"content-encoding", "content-length", "transfer-encoding", "connection"}
    headers = {k: v for k, v in response_headers.items() if k.lower() not in excluded_headers}

    return Response(
        content=content,
        status_code=status_code,
        headers=headers,
    )
