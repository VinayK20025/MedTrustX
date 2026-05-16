"""
Keycloak JWKS module for PAM.
"""
import asyncio
from typing import Any, Dict

import httpx
from opentelemetry import trace

from app.config import settings
from app.observability.logging import get_logger

logger = get_logger(__name__)
tracer = trace.get_tracer(__name__)

_jwks_cache: Dict[str, Any] = {}
_jwks_lock = asyncio.Lock()

async def fetch_jwks() -> Dict[str, Any]:
    url = f"{settings.keycloak_url}/realms/{settings.keycloak_realm}/protocol/openid-connect/certs"
    with tracer.start_as_current_span("keycloak.fetch_jwks"):
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()

async def get_jwks() -> Dict[str, Any]:
    global _jwks_cache
    if not _jwks_cache:
        async with _jwks_lock:
            if not _jwks_cache:
                _jwks_cache = await fetch_jwks()
    return _jwks_cache

async def refresh_jwks_task() -> None:
    global _jwks_cache
    while True:
        await asyncio.sleep(3600)
        try:
            new_jwks = await fetch_jwks()
            async with _jwks_lock:
                _jwks_cache = new_jwks
            logger.info("Successfully refreshed JWKS cache")
        except Exception as e:
            logger.error("Failed to refresh JWKS cache: %s", str(e))
