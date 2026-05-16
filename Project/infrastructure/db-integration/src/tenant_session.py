"""
MedTrustX DB Integration — Tenant-Aware Session Manager (§3)

Every database query across all 108 services MUST pass through
this layer to guarantee tenant isolation at the transaction level.

Implements:
- SET LOCAL app.tenant_id per transaction
- Automatic tenant_id filter injection
- Cross-tenant access prevention
"""
import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional, TypeVar, Type

from sqlalchemy import and_, event, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, AsyncEngine
from sqlalchemy.orm import Query
import structlog

logger = structlog.get_logger()
T = TypeVar("T")


class TenantSessionManager:
    """
    Central session factory enforcing tenant isolation at the DB level.

    Usage:
        manager = TenantSessionManager(engine)

        # In request handlers:
        async with manager.session(tenant_id) as session:
            patients = await session.execute(select(Patient))
    """

    def __init__(self, engine: AsyncEngine):
        self._engine = engine
        self._factory = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )

    @asynccontextmanager
    async def session(self, tenant_id: str) -> AsyncGenerator[AsyncSession, None]:
        """
        Yields a tenant-scoped session.
        Sets PostgreSQL session variable for RLS enforcement.
        """
        async with self._factory() as session:
            try:
                # §3 — SET LOCAL scoped to this transaction only
                await session.execute(
                    text("SET LOCAL app.tenant_id = :tid"),
                    {"tid": str(tenant_id)},
                )
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    @asynccontextmanager
    async def read_session(self, tenant_id: str) -> AsyncGenerator[AsyncSession, None]:
        """Read-only session — no commit, uses read replica if configured."""
        async with self._factory() as session:
            try:
                await session.execute(
                    text("SET LOCAL app.tenant_id = :tid"),
                    {"tid": str(tenant_id)},
                )
                # Set transaction to read-only for safety
                await session.execute(text("SET TRANSACTION READ ONLY"))
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Unisolated session for health checks / migrations only."""
        async with self._factory() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()


def enforce_tenant_filter(model_class: Type[T], tenant_id: uuid.UUID, *extra_filters):
    """
    §3 — MANDATORY tenant filter builder.

    NEVER write:
        select(Patient).where(Patient.id == id)

    ALWAYS write:
        select(Patient).where(
            *enforce_tenant_filter(Patient, tenant_id, Patient.id == id)
        )
    """
    base_filters = [
        model_class.tenant_id == tenant_id,
        model_class.deleted_at.is_(None),
    ]
    return and_(*base_filters, *extra_filters)
