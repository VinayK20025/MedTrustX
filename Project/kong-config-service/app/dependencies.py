"""
FastAPI Dependencies.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from app.db.session import get_db_session
import redis.asyncio as redis_async
from app.config import settings

def get_session() -> AsyncSession:
    pass

async def get_redis():
    redis_client = redis_async.from_url(settings.redis_url)
    try:
        yield redis_client
    finally:
        await redis_client.close()
