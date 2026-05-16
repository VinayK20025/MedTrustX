"""
Database sessions.
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.config import settings

clinical_engine = create_async_engine(settings.clinical_db_url, pool_pre_ping=True, pool_size=5, max_overflow=10)
clinical_session_maker = async_sessionmaker(clinical_engine, expire_on_commit=False, class_=AsyncSession)

operational_engine = create_async_engine(settings.operational_db_url, pool_pre_ping=True, pool_size=5, max_overflow=10)
operational_session_maker = async_sessionmaker(operational_engine, expire_on_commit=False, class_=AsyncSession)

async def get_clinical_session() -> AsyncGenerator[AsyncSession, None]:
    async with clinical_session_maker() as session:
        yield session

async def get_operational_session() -> AsyncGenerator[AsyncSession, None]:
    async with operational_session_maker() as session:
        yield session
