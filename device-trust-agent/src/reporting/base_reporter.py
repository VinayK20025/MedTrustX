"""
MedTrustX Device Trust Agent — BaseReporter Abstract Class.

All four reporter implementations (ZTA, SIEM, Prometheus, OPA) inherit
from BaseReporter, which provides the common interface and shared retry
logic with exponential backoff.
"""

from __future__ import annotations

import asyncio
import time
from abc import ABC, abstractmethod
from typing import Any, Optional

import structlog

from src.models.trust_report import TrustReport

logger = structlog.get_logger(__name__)


class BaseReporter(ABC):
    """Abstract base for all TrustReport reporting targets.

    Subclasses must implement:
        report(trust_report) → None   (async)
        reporter_name → str           (property)
    """

    @property
    @abstractmethod
    def reporter_name(self) -> str:
        """Human-readable name of this reporter (used in log entries)."""
        ...

    @abstractmethod
    async def report(self, trust_report: TrustReport) -> None:
        """Transmit the TrustReport to this reporting target.

        Args:
            trust_report: The fully computed TrustReport to transmit.

        Raises:
            Should not raise — log errors internally and return gracefully.
        """
        ...

    async def report_with_retry(
        self,
        trust_report: TrustReport,
        max_attempts: int = 3,
        base_backoff: float = 2.0,
    ) -> bool:
        """Attempt report() with exponential backoff retry.

        Args:
            trust_report: TrustReport to report.
            max_attempts: Maximum number of attempts before giving up.
            base_backoff: Base backoff multiplier in seconds.
                          Wait time = base_backoff ** attempt.

        Returns:
            True if the report was delivered successfully, False otherwise.
        """
        for attempt in range(1, max_attempts + 1):
            try:
                await self.report(trust_report)
                if attempt > 1:
                    logger.info(
                        "reporter_succeeded_on_retry",
                        reporter=self.reporter_name,
                        attempt=attempt,
                    )
                return True
            except Exception as exc:
                if attempt < max_attempts:
                    wait = base_backoff ** attempt
                    logger.warning(
                        "reporter_attempt_failed",
                        reporter=self.reporter_name,
                        attempt=attempt,
                        max_attempts=max_attempts,
                        wait_seconds=wait,
                        error=str(exc),
                    )
                    await asyncio.sleep(wait)
                else:
                    logger.error(
                        "reporter_all_attempts_failed",
                        reporter=self.reporter_name,
                        max_attempts=max_attempts,
                        error=str(exc),
                    )
        return False
