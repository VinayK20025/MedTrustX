"""
MedTrustX Break-Glass Service — Database Engine (SQLite for local dev)
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
import structlog
from src.config import settings

logger = structlog.get_logger()

# Use aiosqlite for local dev (no PostgreSQL required)
_SQLITE_URL = "sqlite+aiosqlite:///./breakglass.db"
_db_url = settings.DATABASE_URL if settings.ENVIRONMENT != "development" else _SQLITE_URL

engine = create_async_engine(_db_url, echo=False)
AsyncSessionFactory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False, autocommit=False, autoflush=False)

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
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db() -> None:
    from src.models.base import BaseModel
    async with engine.begin() as conn:
        await conn.run_sync(BaseModel.metadata.create_all)
    logger.info("database_tables_created", service=settings.SERVICE_NAME)

async def close_db() -> None:
    await engine.dispose()
