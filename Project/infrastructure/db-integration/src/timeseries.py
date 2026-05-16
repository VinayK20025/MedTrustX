"""
MedTrustX DB Integration — Time-Series Partitioning (§9)

Manages PostgreSQL RANGE partitions for high-frequency data.
"""
from datetime import datetime, timezone, timedelta
from typing import List
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine
import structlog

logger = structlog.get_logger()


class TimeSeriesPartitioner:
    def __init__(self, engine: AsyncEngine, table_name: str, column: str = "recorded_at"):
        self._engine = engine
        self._table = table_name
        self._column = column

    async def create_monthly_partitions(self, months_ahead: int = 3) -> List[str]:
        now = datetime.now(timezone.utc)
        created = []
        for i in range(-1, months_ahead + 1):
            year = now.year + ((now.month + i - 1) // 12)
            month = ((now.month + i - 1) % 12) + 1
            ny = year + (month // 12)
            nm = (month % 12) + 1
            pname = f"{self._table}_y{year}m{month:02d}"
            sql = f"CREATE TABLE IF NOT EXISTS {pname} PARTITION OF {self._table} FOR VALUES FROM ('{year}-{month:02d}-01') TO ('{ny}-{nm:02d}-01');"
            try:
                async with self._engine.begin() as conn:
                    await conn.execute(text(sql))
                created.append(pname)
            except Exception as exc:
                if "already exists" not in str(exc).lower():
                    logger.error("partition_failed", partition=pname, error=str(exc)[:200])
        return created

    async def create_daily_partitions(self, days_ahead: int = 7) -> List[str]:
        now = datetime.now(timezone.utc)
        created = []
        for i in range(-1, days_ahead + 1):
            day = now + timedelta(days=i)
            nd = day + timedelta(days=1)
            pname = f"{self._table}_d{day.strftime('%Y%m%d')}"
            sql = f"CREATE TABLE IF NOT EXISTS {pname} PARTITION OF {self._table} FOR VALUES FROM ('{day.strftime('%Y-%m-%d')}') TO ('{nd.strftime('%Y-%m-%d')}');"
            try:
                async with self._engine.begin() as conn:
                    await conn.execute(text(sql))
                created.append(pname)
            except Exception as exc:
                if "already exists" not in str(exc).lower():
                    logger.error("daily_partition_failed", error=str(exc)[:200])
        return created
