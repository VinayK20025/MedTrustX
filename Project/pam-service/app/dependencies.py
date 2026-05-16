from redis.asyncio import Redis
from app.config import settings

_redis_client = None

def get_redis_client() -> Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = Redis.from_url(settings.redis_url, decode_responses=True)
    return _redis_client

async def get_redis() -> Redis:
    return get_redis_client()
