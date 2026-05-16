"""
app/auth/keycloak.py
=====================
Keycloak JWKS fetcher and in-memory cache for the AI Platform Service.

Responsibilities:
  - Fetch the Keycloak JWKS endpoint on first use and cache the result.
  - Automatically refresh the cache every JWKS_CACHE_TTL seconds via a
    background asyncio task started during application lifespan.
  - Expose ``get_rsa_public_key(kid)`` to retrieve the RSA public key
    object matching a JWT's ``kid`` header — used by pqc_jwt.py.
  - Expose ``get_openid_config()`` to verify the issuer URL dynamically.

Thread-safety:
  - All cache state is protected by an ``asyncio.Lock`` so concurrent
    requests that hit an empty cache do not cause a thundering herd.
  - The background refresh task runs outside the hot path.
"""

from __future__ import annotations

import asyncio
import time
from typing import Any

import httpx
from jose import jwk as jose_jwk
from jose.backends import RSAKey

from app.config import settings
from app.observability.logging import get_logger
from app.observability.metrics import JWKS_CACHE_REFRESHES

logger = get_logger(__name__)

# ─── Module-level cache state ──────────────────────────────────────────────────
_jwks_cache: dict[str, Any] = {}          # kid → JWK dict
_jwks_fetched_at: float = 0.0             # Unix timestamp of last successful fetch
_jwks_lock: asyncio.Lock | None = None    # Initialised lazily (needs running loop)
_refresh_task: asyncio.Task[None] | None = None


def _get_lock() -> asyncio.Lock:
    """Return (or create) the module-level asyncio lock."""
    global _jwks_lock  # noqa: PLW0603
    if _jwks_lock is None:
        _jwks_lock = asyncio.Lock()
    return _jwks_lock


# ─── JWKS fetching ─────────────────────────────────────────────────────────────
async def _fetch_jwks() -> dict[str, Any]:
    """
    Fetch the JWKS document from Keycloak and return a dict keyed by ``kid``.

    Raises:
        httpx.HTTPStatusError: If Keycloak returns a non-2xx status.
        httpx.RequestError: If the network request fails.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(settings.keycloak_jwks_url)
        response.raise_for_status()
        data = response.json()

    keys_by_kid: dict[str, Any] = {}
    for key_data in data.get("keys", []):
        kid = key_data.get("kid")
        if kid:
            keys_by_kid[kid] = key_data

    logger.info(
        "JWKS fetched from Keycloak",
        extra={
            "jwks_url": settings.keycloak_jwks_url,
            "num_keys": len(keys_by_kid),
            "kids": list(keys_by_kid.keys()),
        },
    )
    return keys_by_kid


async def _refresh_cache() -> None:
    """
    Refresh the in-memory JWKS cache.  Acquires the lock, fetches JWKS,
    and updates the shared cache dict and timestamp atomically.

    On failure: logs the error, increments the error counter, and leaves
    the existing cache intact so in-flight requests continue to work.
    """
    global _jwks_cache, _jwks_fetched_at  # noqa: PLW0603
    lock = _get_lock()
    async with lock:
        try:
            fresh = await _fetch_jwks()
            _jwks_cache = fresh
            _jwks_fetched_at = time.monotonic()
            JWKS_CACHE_REFRESHES.labels(status="success").inc()
        except Exception as exc:  # noqa: BLE001
            JWKS_CACHE_REFRESHES.labels(status="error").inc()
            logger.error(
                "JWKS cache refresh failed",
                extra={"error": str(exc), "jwks_url": settings.keycloak_jwks_url},
            )


# ─── Background refresh loop ───────────────────────────────────────────────────
async def _jwks_refresh_loop() -> None:
    """
    Continuously refresh the JWKS cache every ``JWKS_CACHE_TTL`` seconds.

    This coroutine is started as a background task in ``app/main.py`` lifespan
    and cancelled during shutdown.
    """
    while True:
        await asyncio.sleep(settings.jwks_cache_ttl)
        logger.debug("Scheduled JWKS cache refresh triggered")
        await _refresh_cache()


async def start_jwks_background_refresh() -> None:
    """
    Start the background JWKS refresh task.

    Call once during application startup.  The task is stored as a module-level
    reference to allow cancellation on shutdown.
    """
    global _refresh_task  # noqa: PLW0603
    # Perform an immediate initial fetch before accepting traffic
    await _refresh_cache()
    _refresh_task = asyncio.create_task(
        _jwks_refresh_loop(), name="jwks-refresh-loop"
    )
    logger.info(
        "JWKS background refresh task started",
        extra={"refresh_interval_s": settings.jwks_cache_ttl},
    )


async def stop_jwks_background_refresh() -> None:
    """Cancel the background JWKS refresh task during shutdown."""
    global _refresh_task  # noqa: PLW0603
    if _refresh_task and not _refresh_task.done():
        _refresh_task.cancel()
        try:
            await _refresh_task
        except asyncio.CancelledError:
            pass
        logger.info("JWKS background refresh task stopped")


# ─── Public API ────────────────────────────────────────────────────────────────
async def get_jwks() -> dict[str, Any]:
    """
    Return the current JWKS cache, refreshing if it is empty or expired.

    Returns:
        Dict mapping ``kid`` strings to JWK dicts.
    """
    now = time.monotonic()
    cache_age = now - _jwks_fetched_at
    if not _jwks_cache or cache_age > settings.jwks_cache_ttl:
        await _refresh_cache()
    return _jwks_cache


async def get_rsa_public_key(kid: str) -> RSAKey:
    """
    Return the RSA public key for the given ``kid``.

    Attempts to find the key in cache first; if not found, triggers an
    immediate JWKS refresh (handles key rotation).

    Args:
        kid: The ``kid`` field from the JWT header.

    Returns:
        A ``python-jose`` RSAKey object ready for signature verification.

    Raises:
        KeyError: If the ``kid`` is not found even after a refresh.
    """
    cache = await get_jwks()
    if kid not in cache:
        # Key rotation: try a fresh fetch before giving up
        logger.warning(
            "JWT kid not found in JWKS cache — forcing refresh",
            extra={"kid": kid},
        )
        await _refresh_cache()
        cache = _jwks_cache

    if kid not in cache:
        raise KeyError(
            f"JWT signing key kid={kid!r} not found in Keycloak JWKS. "
            f"Available kids: {list(cache.keys())}"
        )

    key_data = cache[kid]
    return jose_jwk.construct(key_data, algorithm="RS256")


async def get_openid_config() -> dict[str, Any]:
    """
    Fetch the OpenID Connect discovery document from Keycloak.

    Used during startup to verify the issuer URL matches config.

    Returns:
        The OpenID Connect configuration dict.
    """
    discovery_url = (
        f"{settings.keycloak_url}/realms/{settings.keycloak_realm}"
        "/.well-known/openid-configuration"
    )
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(discovery_url)
        response.raise_for_status()
        return response.json()
