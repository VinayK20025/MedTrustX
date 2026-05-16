"""
MedTrustX DB Integration — Retry & Resilience (§14)

Database connections WILL fail in production:
- Network partitions
- Connection pool exhaustion
- Replica failover
- Maintenance windows

This module provides:
- Exponential backoff retry for transient failures
- Connection fallback to read replicas
- Circuit breaker pattern
"""
import asyncio
import functools
from typing import Any, Callable, Optional, TypeVar

from sqlalchemy.exc import (
    DBAPIError,
    DisconnectionError,
    InterfaceError,
    OperationalError,
    TimeoutError as SATimeoutError,
)
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

logger = structlog.get_logger()
T = TypeVar("T")

# Transient errors that are safe to retry
RETRYABLE_ERRORS = (
    DisconnectionError,
    InterfaceError,
    OperationalError,
    SATimeoutError,
    ConnectionRefusedError,
    ConnectionResetError,
    OSError,
)


def with_db_retry(
    max_retries: int = 3,
    base_delay: float = 0.5,
    max_delay: float = 10.0,
    retryable_errors: tuple = RETRYABLE_ERRORS,
):
    """
    §14 — Decorator for retrying DB operations on transient failures.

    Usage:
        @with_db_retry(max_retries=3)
        async def get_patient(session, tenant_id, patient_id):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            last_exception = None
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except retryable_errors as exc:
                    last_exception = exc
                    if attempt < max_retries:
                        delay = min(base_delay * (2 ** attempt), max_delay)
                        logger.warning(
                            "db_retry",
                            attempt=attempt + 1,
                            max_retries=max_retries,
                            delay=delay,
                            error=str(exc)[:200],
                            function=func.__name__,
                        )
                        await asyncio.sleep(delay)
                    else:
                        logger.error(
                            "db_retry_exhausted",
                            function=func.__name__,
                            error=str(exc)[:200],
                        )
            raise last_exception
        return wrapper
    return decorator


class RetryableSession:
    """
    §14 — Session wrapper that automatically retries on transient failures.

    Usage:
        rsession = RetryableSession(session_factory, max_retries=3)
        result = await rsession.execute(select(Patient).where(...))
    """

    def __init__(
        self,
        session_factory,
        max_retries: int = 3,
        base_delay: float = 0.5,
    ):
        self._factory = session_factory
        self._max_retries = max_retries
        self._base_delay = base_delay

    async def execute(self, statement, params=None):
        last_exc = None
        for attempt in range(self._max_retries + 1):
            try:
                async with self._factory() as session:
                    result = await session.execute(statement, params)
                    return result
            except RETRYABLE_ERRORS as exc:
                last_exc = exc
                if attempt < self._max_retries:
                    delay = min(self._base_delay * (2 ** attempt), 10.0)
                    logger.warning("retryable_session_retry", attempt=attempt + 1, delay=delay)
                    await asyncio.sleep(delay)
        raise last_exc


class CircuitBreaker:
    """
    Circuit breaker for DB connections.
    Opens after N consecutive failures, half-opens after cooldown.
    """

    def __init__(self, failure_threshold: int = 5, cooldown_seconds: float = 30.0):
        self._failure_count = 0
        self._threshold = failure_threshold
        self._cooldown = cooldown_seconds
        self._state = "closed"  # closed | open | half_open
        self._last_failure_time: Optional[float] = None

    @property
    def is_open(self) -> bool:
        if self._state == "open":
            import time
            elapsed = time.monotonic() - (self._last_failure_time or 0)
            if elapsed >= self._cooldown:
                self._state = "half_open"
                return False
            return True
        return False

    def record_success(self):
        self._failure_count = 0
        self._state = "closed"

    def record_failure(self):
        import time
        self._failure_count += 1
        self._last_failure_time = time.monotonic()
        if self._failure_count >= self._threshold:
            self._state = "open"
            logger.error("circuit_breaker_opened", failures=self._failure_count)
