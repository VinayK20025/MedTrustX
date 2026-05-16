"""
MedTrustX DB Integration — Row-Level Security (§13)

PostgreSQL RLS provides defence-in-depth for tenant isolation.
Even if application code has a bug, the database itself will
REFUSE to return rows belonging to another tenant.

This module:
- Generates RLS policies per table
- Manages SET LOCAL app.tenant_id
- Provides migration helpers
"""
from typing import List
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, AsyncEngine
import structlog

logger = structlog.get_logger()


class RLSPolicy:
    """
    §13 — Row-Level Security policy definition.

    Usage:
        policy = RLSPolicy(table="patients", tenant_column="tenant_id")
        await policy.apply(engine)
    """

    def __init__(self, table: str, tenant_column: str = "tenant_id", policy_name: str = None):
        self.table = table
        self.tenant_column = tenant_column
        self.policy_name = policy_name or f"tenant_isolation_{table}"

    def generate_sql(self) -> List[str]:
        """Generate SQL statements to enable RLS on a table."""
        return [
            f"ALTER TABLE {self.table} ENABLE ROW LEVEL SECURITY;",
            f"ALTER TABLE {self.table} FORCE ROW LEVEL SECURITY;",
            f"""
            CREATE POLICY {self.policy_name} ON {self.table}
                USING ({self.tenant_column} = current_setting('app.tenant_id')::uuid);
            """,
            # Allow service account to bypass RLS for admin/migration operations
            f"""
            CREATE POLICY {self.policy_name}_admin ON {self.table}
                TO medtrust_admin
                USING (true);
            """,
        ]

    async def apply(self, engine: AsyncEngine) -> None:
        """Apply RLS policy to the database."""
        async with engine.begin() as conn:
            for sql in self.generate_sql():
                try:
                    await conn.execute(text(sql))
                except Exception as exc:
                    # Policy may already exist — log and continue
                    if "already exists" in str(exc).lower():
                        logger.debug("rls_policy_exists", table=self.table)
                    else:
                        logger.error("rls_apply_failed", table=self.table, error=str(exc)[:200])

    async def drop(self, engine: AsyncEngine) -> None:
        """Remove RLS policy (for testing/migration)."""
        async with engine.begin() as conn:
            try:
                await conn.execute(text(f"DROP POLICY IF EXISTS {self.policy_name} ON {self.table};"))
                await conn.execute(text(f"DROP POLICY IF EXISTS {self.policy_name}_admin ON {self.table};"))
                await conn.execute(text(f"ALTER TABLE {self.table} DISABLE ROW LEVEL SECURITY;"))
            except Exception as exc:
                logger.error("rls_drop_failed", table=self.table, error=str(exc)[:200])


async def enable_rls(engine: AsyncEngine, tables: List[str], tenant_column: str = "tenant_id") -> None:
    """
    §13 — Batch-enable RLS on all domain tables for a service.

    Usage (in service startup):
        await enable_rls(engine, ["patients", "encounters", "vitals"])
    """
    for table in tables:
        policy = RLSPolicy(table=table, tenant_column=tenant_column)
        await policy.apply(engine)
        logger.info("rls_enabled", table=table)


async def set_tenant_context(session: AsyncSession, tenant_id: str) -> None:
    """Set the PostgreSQL session variable for RLS evaluation."""
    await session.execute(
        text("SET LOCAL app.tenant_id = :tid"),
        {"tid": tenant_id},
    )
