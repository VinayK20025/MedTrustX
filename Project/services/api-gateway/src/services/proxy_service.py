"""
MedTrustX Internal API Gateway — HTTP Reverse Proxy Engine
"""
import time
import uuid
from typing import Optional, Tuple

import httpx
from fastapi import HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from src.models.gateway import GatewayLog, GatewayRoute
from src.services.event_publisher import publish_event

logger = structlog.get_logger()

# We use a global async client with connection pooling for performance
client = httpx.AsyncClient(
    timeout=httpx.Timeout(10.0, connect=2.0),
    limits=httpx.Limits(max_keepalive_connections=100, max_connections=200),
)


async def get_matching_route(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    path: str,
    method: str,
) -> Optional[GatewayRoute]:
    """
    Very simple exact/prefix matcher. In a production gateway, this would be cached in Redis.
    """
    result = await session.execute(
        select(GatewayRoute).where(
            GatewayRoute.tenant_id == tenant_id,
            GatewayRoute.active == True,
            # In a real impl, we'd use regex or prefix matching. For DHOS mockup,
            # we do a simple LIKE query
            GatewayRoute.path.like(path + "%"),
        )
    )
    routes = result.scalars().all()
    if not routes:
        return None
    # Prioritize exact method match, else fallback to wildcard
    for r in routes:
        if r.method == method or r.method == "*":
            return r
    return None


async def forward_request(
    request: Request,
    target_path: str,
    session: AsyncSession,
    tenant_id: uuid.UUID,
) -> Tuple[int, bytes, httpx.Headers]:
    """
    The core reverse-proxy logic forwarding the request to the upstream microservice.
    """
    method = request.method
    full_path = f"/{target_path}"
    
    # 1. Match Route
    route = await get_matching_route(session, tenant_id, full_path, method)
    if not route:
        logger.warning("no_route_matched", path=full_path, method=method)
        await publish_event("REQUEST_DENIED", tenant_id, {"reason": "no_route", "path": full_path})
        raise HTTPException(status_code=404, detail="Gateway route not found")

    # 2. Extract context
    body = await request.body()
    headers = dict(request.headers)
    # Strip host header to allow httpx to set it correctly for the upstream
    headers.pop("host", None)
    # Inject traceability headers
    request_id = uuid.uuid4()
    headers["X-Gateway-Request-Id"] = str(request_id)
    headers["X-Forwarded-For"] = request.client.host if request.client else "unknown"

    upstream_url = f"{route.upstream_url.rstrip('/')}{full_path}"
    query_params = request.url.query
    if query_params:
        upstream_url = f"{upstream_url}?{query_params}"

    logger.debug("forwarding_request", req_id=request_id, upstream=upstream_url)
    
    start_time = time.perf_counter()

    # 3. Forward
    try:
        response = await client.request(
            method=method,
            url=upstream_url,
            content=body,
            headers=headers,
        )
    except httpx.RequestError as exc:
        logger.error("upstream_connection_failed", req_id=request_id, error=str(exc))
        raise HTTPException(status_code=502, detail="Bad Gateway: Upstream unavailable")
    
    latency_ms = int((time.perf_counter() - start_time) * 1000)

    # 4. Audit Log
    log_entry = GatewayLog(
        tenant_id=tenant_id,
        request_id=request_id,
        path=full_path,
        method=method,
        status_code=response.status_code,
        latency_ms=latency_ms,
    )
    session.add(log_entry)
    # We commit in the controller

    # 5. Emit Metrics Event
    await publish_event(
        "REQUEST_FORWARDED",
        tenant_id,
        payload={
            "request_id": str(request_id),
            "service": route.service_name,
            "status": response.status_code,
            "latency_ms": latency_ms,
        }
    )

    # Note: For large files, we'd use StreamingResponse. For now, read full content.
    return response.status_code, response.content, response.headers
