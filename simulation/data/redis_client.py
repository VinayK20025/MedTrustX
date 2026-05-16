"""Redis connection and pub/sub wrapper."""
import redis as redis_lib
from typing import Optional
from config import REDIS_CONFIG
from core.colors import print_ok, print_warn

_client: Optional[redis_lib.Redis] = None

def get_client() -> Optional[redis_lib.Redis]:
    """Get or create Redis client."""
    global _client
    if _client is None:
        try:
            _client = redis_lib.Redis(**REDIS_CONFIG)
            _client.ping()
        except Exception:
            _client = None
    return _client

def ping() -> bool:
    """Test Redis connectivity."""
    try:
        client = get_client()
        if client:
            client.ping()
            return True
    except Exception:
        pass
    return False

def get_info() -> dict:
    """Get Redis server info."""
    client = get_client()
    if not client:
        return {}
    try:
        return client.info('server')
    except Exception:
        return {}

def publish(channel: str, message: str) -> None:
    """Publish message to Redis channel."""
    client = get_client()
    if client:
        try:
            client.publish(channel, message)
        except Exception as e:
            print_warn(f"Redis publish failed: {e}")
