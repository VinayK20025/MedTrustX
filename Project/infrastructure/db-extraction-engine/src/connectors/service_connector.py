"""
MedTrustX DB Extraction Engine — Service DB Connectors (§3B)

Each upstream service DB is accessed via a read-only connector.
NEVER direct joins — always controlled, tenant-scoped connectors.
"""
from typing import Dict, Optional
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import text
import structlog

logger = structlog.get_logger()


class ServiceConnector:
    """Read-only connector to a specific service's DB replica."""

    def __init__(self, service_name: str, db_url: str, pool_size: int = 5):
        self.service_name = service_name
        self._engine = create_async_engine(
            db_url, pool_size=pool_size, max_overflow=3, pool_pre_ping=True, pool_recycle=300,
            connect_args={"server_settings": {"application_name": f"extraction:{service_name}", "default_transaction_read_only": "on"}},
        )
        self._factory = async_sessionmaker(bind=self._engine, class_=AsyncSession, expire_on_commit=False)

    async def execute(self, stmt, tenant_id: str, params: dict = None):
        """Execute a tenant-scoped query on this service's DB."""
        async with self._factory() as session:
            await session.execute(text("SET LOCAL app.tenant_id = :tid"), {"tid": tenant_id})
            result = await session.execute(stmt, params)
            return result

    async def close(self):
        await self._engine.dispose()


class ConnectorRegistry:
    """Central registry of all service DB connectors."""

    def __init__(self):
        self._connectors: Dict[str, ServiceConnector] = {}

    def register(self, service_name: str, db_url: str, pool_size: int = 5):
        self._connectors[service_name] = ServiceConnector(service_name, db_url, pool_size)
        logger.info("connector_registered", service=service_name)

    def get(self, service_name: str) -> Optional[ServiceConnector]:
        return self._connectors.get(service_name)

    async def close_all(self):
        for name, conn in self._connectors.items():
            await conn.close()
            logger.info("connector_closed", service=name)


# Global registry — initialized at startup
registry = ConnectorRegistry()
