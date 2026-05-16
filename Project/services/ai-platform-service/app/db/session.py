"""
app/db/session.py
=================
Async SQLAlchemy engine and session factory for the analytics PostgreSQL database.

Key design choices:
  - asyncpg driver via ``postgresql+asyncpg://`` DSN for full async I/O.
  - ``NullPool`` is NOT used — we keep a connection pool (pool_size + max_overflow)
    for throughput.  The pool is safe across all uvicorn workers because we run
    with a single worker (horizontal scale via Kubernetes HPA).
  - Every session is scoped to a single request via ``AsyncSessionLocal()``.
  - ``set_tenant_id()`` executes ``SET LOCAL app.tenant_id = '...'`` at the start
    of every DB operation to activate PostgreSQL Row Level Security (RLS) policies.
  - ``get_db()`` is a FastAPI dependency that yields a managed session with
    automatic commit/rollback and tenant isolation enforcement.
  - ``get_db_session()`` is an async context manager for use in background tasks
    and services that run outside the request lifecycle.
"""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings
from app.observability.logging import get_logger

logger = get_logger(__name__)

# ─── Engine (module-level singleton) ──────────────────────────────────────────
_engine: AsyncEngine | None = None


def _get_engine() -> AsyncEngine:
    """
    Return the shared async SQLAlchemy engine, creating it on first call.

    Idempotent — subsequent calls return the same engine instance.
    """
    global _engine  # noqa: PLW0603
    if _engine is not None:
        return _engine

    _engine = create_async_engine(
        settings.analytics_db_dsn,
        # ── Connection pool ────────────────────────────────────────────────
        pool_size=settings.analytics_db_pool_size,
        max_overflow=settings.analytics_db_max_overflow,
        # Recycle connections after 30 minutes to avoid stale connections
        pool_recycle=1800,
        # Ping the DB before checkout to detect broken connections early
        pool_pre_ping=True,
        # ── Debugging ─────────────────────────────────────────────────────
        # Emit SQL statements to logger in debug mode only
        echo=(settings.log_level == "debug"),
        # ── asyncpg-specific options ───────────────────────────────────────
        connect_args={
            # asyncpg connection timeout
            "command_timeout": settings.analytics_db_query_timeout,
            # Prefer statement caching for repeated parameterised queries
            "statement_cache_size": 500,
        },
    )

    logger.info(
        "Analytics DB engine created",
        extra={
            "host": settings.analytics_db_host,
            "port": settings.analytics_db_port,
            "database": settings.analytics_db_name,
            "pool_size": settings.analytics_db_pool_size,
            "max_overflow": settings.analytics_db_max_overflow,
        },
    )
    return _engine


# ─── Session factory ───────────────────────────────────────────────────────────
def _get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Return the async session factory bound to the shared engine."""
    return async_sessionmaker(
        bind=_get_engine(),
        class_=AsyncSession,
        expire_on_commit=False,  # Avoid lazy-load errors after commit
        autoflush=False,
        autocommit=False,
    )


# ─── Tenant isolation helper ───────────────────────────────────────────────────
async def set_tenant_id(session: AsyncSession, tenant_id: str) -> None:
    """
    Execute ``SET LOCAL app.tenant_id = '<tenant_id>'`` on the current
    PostgreSQL connection, activating the RLS policy for the session.

    ``SET LOCAL`` scopes the variable to the current transaction, so it is
    reset automatically when the transaction ends.  This is intentional —
    every new transaction must call this function.

    Args:
        session:   The active async SQLAlchemy session.
        tenant_id: The validated tenant identifier from the JWT.

    Raises:
        ValueError: If ``tenant_id`` is empty or contains SQL-unsafe characters.
    """
    if not tenant_id or not tenant_id.replace("_", "").replace("-", "").isalnum():
        raise ValueError(
            f"Invalid tenant_id for DB session variable: {tenant_id!r}. "
            "Must contain only alphanumeric characters, underscores, or hyphens."
        )
    await session.execute(
        text(f"SET LOCAL {settings.pg_tenant_session_var} = :tid"),
        {"tid": tenant_id},
    )


# ─── FastAPI dependency ────────────────────────────────────────────────────────
async def get_db(tenant_id: str = "system") -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a request-scoped async database session
    with tenant isolation pre-configured.

    Usage in a router::

        from app.db.session import get_db

        @router.post("/example")
        async def handler(
            db: AsyncSession = Depends(lambda: get_db("tenant_apollo")),
        ):
            ...

    The real usage pattern injects tenant_id from the auth middleware via
    ``app/dependencies.py`` which wraps this function.

    Args:
        tenant_id: Validated tenant identifier extracted from JWT.

    Yields:
        An ``AsyncSession`` with RLS already activated for the tenant.
    """
    factory = _get_session_factory()
    async with factory() as session:
        try:
            async with asyncio.timeout(settings.analytics_db_query_timeout * 3):
                # Activate RLS for this session
                await set_tenant_id(session, tenant_id)
                yield session
                await session.commit()
        except asyncio.TimeoutError:
            await session.rollback()
            logger.error(
                "DB session timed out — rolled back",
                extra={"tenant_id": tenant_id},
            )
            raise
        except Exception:
            await session.rollback()
            raise


# ─── Context manager (for background tasks / services) ────────────────────────
@asynccontextmanager
async def get_db_session(tenant_id: str) -> AsyncGenerator[AsyncSession, None]:
    """
    Async context manager that yields a managed session for use outside the
    FastAPI request lifecycle (e.g. background tasks, service methods).

    Example::

        async with get_db_session("tenant_apollo") as session:
            rows = await session.execute(select(PatientVital))

    Args:
        tenant_id: Validated tenant identifier.

    Yields:
        An ``AsyncSession`` with RLS activated and automatic commit/rollback.
    """
    factory = _get_session_factory()
    async with factory() as session:
        try:
            await set_tenant_id(session, tenant_id)
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ─── Engine lifecycle ──────────────────────────────────────────────────────────
async def dispose_engine() -> None:
    """
    Gracefully close all connections in the connection pool.

    Called during application shutdown (``app/main.py`` lifespan handler).
    """
    global _engine  # noqa: PLW0603
    if _engine is not None:
        logger.info("Disposing analytics DB connection pool")
        await _engine.dispose()
        _engine = None
