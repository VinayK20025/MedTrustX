"""
MedTrustX Bed Management Service — Database Engine & Session Factory

Provides:
  - Async SQLAlchemy engine with connection pooling
  - Tenant-scoped async sessions (sets app.tenant_id on every connection)
  - Lifespan helpers for startup/shutdown
  - Table creation utility for development
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy import text
import structlog

from src.config import settings

logger = structlog.get_logger()

# ── Engine ──────────────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.LOG_LEVEL == "debug",
    connect_args={
        "server_settings": {
            "application_name": settings.SERVICE_NAME,
        }
    },
)

# ── Session factory ─────────────────────────────────────────────
AsyncSessionFactory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency: yields a raw async session."""
    async with AsyncSessionFactory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_tenant_session(tenant_id: str) -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager that yields an AsyncSession with PostgreSQL
    ``app.tenant_id`` set — enabling Row-Level Security (RLS) policies.
    """
    async with AsyncSessionFactory() as session:
        try:
            await session.execute(
                text("SET LOCAL app.tenant_id = :tid"),
                {"tid": tenant_id},
            )
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# ── Lifespan helpers ────────────────────────────────────────────
async def init_db() -> None:
    """Create tables in development mode. Production uses Alembic migrations."""
    from src.models.base import BaseModel  # noqa: avoid circular

    if settings.ENVIRONMENT == "development":
        async with engine.begin() as conn:
            await conn.run_sync(BaseModel.metadata.create_all)
        logger.info("database_tables_created", service=settings.SERVICE_NAME)


async def close_db() -> None:
    """Dispose engine connection pool."""
    await engine.dispose()
    logger.info("database_connections_closed", service=settings.SERVICE_NAME)
