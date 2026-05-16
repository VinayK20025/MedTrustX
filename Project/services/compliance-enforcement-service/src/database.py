"""
MedTrustX Compliance Enforcement Service — Database Engine & Session Factory
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import text
import structlog

from src.config import settings

logger = structlog.get_logger()

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.LOG_LEVEL == "debug",
    connect_args={"server_settings": {"application_name": settings.SERVICE_NAME}},
)

AsyncSessionFactory = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False, autocommit=False, autoflush=False
)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
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
    async with AsyncSessionFactory() as session:
        try:
            await session.execute(text("SET LOCAL app.tenant_id = :tid"), {"tid": tenant_id})
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db() -> None:
    from src.models.base import BaseModel
    if settings.ENVIRONMENT == "development":
        async with engine.begin() as conn:
            await conn.run_sync(BaseModel.metadata.create_all)
        logger.info("database_tables_created", service=settings.SERVICE_NAME)

async def close_db() -> None:
    await engine.dispose()
    logger.info("database_connections_closed", service=settings.SERVICE_NAME)
