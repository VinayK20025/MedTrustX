"""
Per-Service Circuit Breaker.
"""
import time
import json
from typing import Callable, Any
from fastapi import HTTPException
import redis.asyncio as redis_async

from app.config import settings
from app.observability.logging import get_logger

logger = get_logger(__name__)

class CircuitBreaker:
    def __init__(self):
        self.redis = redis_async.from_url(settings.redis_url)
        self.failure_threshold = 5
        self.failure_window = 60
        self.reset_timeout = 30

    async def _publish_state(self, service: str, state: str, failures: int):
        event = {
            "event": "circuit_state_changed",
            "service": service,
            "state": state,
            "failures": failures,
            "timestamp": time.time()
        }
        await self.redis.publish("medtrust:gateway:circuit", json.dumps(event))

    async def call(self, service_name: str, request_fn: Callable) -> Any:
        state_key = f"medtrust:circuit:{service_name}:state"
        failures_key = f"medtrust:circuit:{service_name}:failures"
        last_failure_key = f"medtrust:circuit:{service_name}:last_failure"

        state_b = await self.redis.get(state_key)
        state = state_b.decode() if state_b else "CLOSED"

        if state == "OPEN":
            last_failure_b = await self.redis.get(last_failure_key)
            last_failure = float(last_failure_b.decode()) if last_failure_b else 0
            
            if time.time() - last_failure > self.reset_timeout:
                await self.redis.set(state_key, "HALF_OPEN")
                state = "HALF_OPEN"
                await self._publish_state(service_name, "HALF_OPEN", 0)
            else:
                raise HTTPException(status_code=503, detail=f"Service {service_name} circuit breaker is OPEN")

        try:
            result = await request_fn()
            
            if state == "HALF_OPEN":
                await self.redis.set(state_key, "CLOSED")
                await self.redis.set(failures_key, 0)
                await self._publish_state(service_name, "CLOSED", 0)
                
            return result
            
        except Exception as e:
            failures = await self.redis.incr(failures_key)
            if failures == 1:
                await self.redis.expire(failures_key, self.failure_window)
                
            await self.redis.set(last_failure_key, str(time.time()))
            
            if failures >= self.failure_threshold and state in ["CLOSED", "HALF_OPEN"]:
                await self.redis.set(state_key, "OPEN")
                await self._publish_state(service_name, "OPEN", failures)
                logger.error("Circuit breaker tripped for %s", service_name)
                
            raise e
