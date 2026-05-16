"""
Database sessions.
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.config import settings

clinical_engine = create_async_engine(
    settings.clinical_db_url, pool_pre_ping=True, pool_size=10, max_overflow=20
)
clinical_session_maker = async_sessionmaker(
    clinical_engine, expire_on_commit=False, class_=AsyncSession
)

analytics_engine = create_async_engine(
    settings.analytics_db_url, pool_pre_ping=True, pool_size=5, max_overflow=10
)
analytics_session_maker = async_sessionmaker(
    analytics_engine, expire_on_commit=False, class_=AsyncSession
)

async def get_clinical_session() -> AsyncGenerator[AsyncSession, None]:
    async with clinical_session_maker() as session:
        yield session

async def get_analytics_session() -> AsyncGenerator[AsyncSession, None]:
    async with analytics_session_maker() as session:
        yield session
