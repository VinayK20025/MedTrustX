"""
MedTrustX DB Integration — Connection Pool Factory (§2)

Creates production-grade SQLAlchemy async engines with:
- Configurable pool sizes per service tier
- Pre-ping health checks
- Connection recycling to prevent stale connections
- Application-name tagging for pg_stat_activity visibility
"""
from dataclasses import dataclass, field
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
import structlog

logger = structlog.get_logger()


@dataclass
class PoolConfig:
    """Service-tier-aware connection pool configuration."""
    pool_size: int = 20
    max_overflow: int = 10
    pool_pre_ping: bool = True
    pool_recycle: int = 300          # seconds — prevents stale connections
    pool_timeout: int = 30           # seconds — wait for connection from pool
    echo: bool = False               # SQL logging in dev mode
    statement_cache_size: int = 0    # disable for pgbouncer compatibility

    # Tier presets
    @classmethod
    def tier0_critical(cls) -> "PoolConfig":
        """IAM, Patient, Clinical — highest availability."""
        return cls(pool_size=40, max_overflow=20, pool_recycle=180)

    @classmethod
    def tier1_standard(cls) -> "PoolConfig":
        """Most operational services."""
        return cls(pool_size=20, max_overflow=10, pool_recycle=300)

    @classmethod
    def tier2_analytics(cls) -> "PoolConfig":
        """Analytics, reporting — longer queries, fewer connections."""
        return cls(pool_size=10, max_overflow=5, pool_recycle=600, pool_timeout=60)

    @classmethod
    def tier3_batch(cls) -> "PoolConfig":
        """Batch workers, migration runners."""
        return cls(pool_size=5, max_overflow=2, pool_recycle=900)


def create_engine_with_pool(
    database_url: str,
    service_name: str,
    config: Optional[PoolConfig] = None,
) -> AsyncEngine:
    """
    Factory function creating a production-grade async engine.

    Every service MUST use this instead of raw create_async_engine
    to guarantee consistent pool management across the fleet.
    """
    if config is None:
        config = PoolConfig.tier1_standard()

    engine = create_async_engine(
        database_url,
        pool_size=config.pool_size,
        max_overflow=config.max_overflow,
        pool_pre_ping=config.pool_pre_ping,
        pool_recycle=config.pool_recycle,
        pool_timeout=config.pool_timeout,
        echo=config.echo,
        connect_args={
            "server_settings": {
                "application_name": service_name,
                "statement_timeout": "30000",       # 30s query timeout
                "idle_in_transaction_session_timeout": "60000",  # 60s idle txn
            },
            "prepared_statement_cache_size": config.statement_cache_size,
        },
    )

    logger.info(
        "db_engine_created",
        service=service_name,
        pool_size=config.pool_size,
        max_overflow=config.max_overflow,
        recycle=config.pool_recycle,
    )
    return engine
