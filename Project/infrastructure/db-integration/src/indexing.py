"""
MedTrustX DB Integration — Indexing Strategy Helper (§10)
"""
from typing import List
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine
import structlog

logger = structlog.get_logger()

STANDARD_INDEXES = [
    "CREATE INDEX IF NOT EXISTS ix_{table}_tenant ON {table}(tenant_id);",
    "CREATE INDEX IF NOT EXISTS ix_{table}_tenant_created ON {table}(tenant_id, created_at DESC);",
    "CREATE INDEX IF NOT EXISTS ix_{table}_deleted ON {table}(deleted_at) WHERE deleted_at IS NULL;",
]

async def ensure_standard_indexes(engine: AsyncEngine, tables: List[str]) -> int:
    count = 0
    async with engine.begin() as conn:
        for table in tables:
            for tmpl in STANDARD_INDEXES:
                sql = tmpl.format(table=table)
                try:
                    await conn.execute(text(sql))
                    count += 1
                except Exception as exc:
                    logger.debug("index_skip", table=table, error=str(exc)[:100])
    logger.info("indexes_ensured", tables=len(tables), indexes=count)
    return count
