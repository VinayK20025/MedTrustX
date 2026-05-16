"""
Database sessions configuration.
"""
from typing import AsyncGenerator, Dict

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncEngine
from medtrust_rls.session import configure_engine, get_rls_session as rls_get_rls_session

from app.config import settings

# Define raw engines for bypass/system tasks
engines: Dict[str, AsyncEngine] = {
    "clinical": create_async_engine(settings.clinical_db_url, pool_pre_ping=True, pool_size=5),
    "operational": create_async_engine(settings.operational_db_url, pool_pre_ping=True, pool_size=5),
    "iam": create_async_engine(settings.iam_db_url, pool_pre_ping=True, pool_size=5),
    "analytics": create_async_engine(settings.analytics_db_url, pool_pre_ping=True, pool_size=5),
}

raw_session_makers = {
    name: async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    for name, engine in engines.items()
}

# Configure RLS sessions for normal data access
configure_engine("clinical", settings.clinical_db_url, pool_pre_ping=True, pool_size=5)
configure_engine("operational", settings.operational_db_url, pool_pre_ping=True, pool_size=5)
configure_engine("iam", settings.iam_db_url, pool_pre_ping=True, pool_size=5)
configure_engine("analytics", settings.analytics_db_url, pool_pre_ping=True, pool_size=5)

async def get_clinical_session() -> AsyncGenerator:
    async for session in rls_get_rls_session("clinical"):
        yield session

async def get_operational_session() -> AsyncGenerator:
    async for session in rls_get_rls_session("operational"):
        yield session

async def get_iam_session() -> AsyncGenerator:
    async for session in rls_get_rls_session("iam"):
        yield session

async def get_analytics_session() -> AsyncGenerator:
    async for session in rls_get_rls_session("analytics"):
        yield session

async def get_raw_session(db_name: str) -> AsyncSession:
    """Get a non-RLS session for system/admin operations."""
    return raw_session_makers[db_name]()
