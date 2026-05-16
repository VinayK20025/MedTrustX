"""
MedTrustX Device Trust Agent — BaseCheck Abstract Class.

All 10 security check implementations inherit from BaseCheck.
BaseCheck provides:
  - Abstract interface: run() and is_supported()
  - execute() wrapper with timeout enforcement, exception handling,
    and duration measurement
  - Structured JSON logging for every check execution
  - Consistent error score (1.0) when a check fails to execute
"""

from __future__ import annotations

import asyncio
import time
from abc import ABC, abstractmethod
from typing import Optional

import structlog

from src.models.check_result import CheckResult
from src.platform_detector import Platform, PlatformInfo, detect_platform

logger = structlog.get_logger(__name__)


class BaseCheck(ABC):
    """Abstract base for all 10 device security checks.

    Subclasses must implement:
        run()          — execute the platform-specific check logic
        is_supported() — declare which platforms are supported

    Subclasses must define class-level attributes:
        CHECK_ID   (int)   — 1–10
        CHECK_NAME (str)   — human-readable name
        WEIGHT     (float) — contribution to composite score
    """

    CHECK_ID: int
    CHECK_NAME: str
    WEIGHT: float
    TIMEOUT_SECONDS: int = 10

    def __init__(self, platform_info: Optional[PlatformInfo] = None) -> None:
        """Initialize check with platform info.

        Args:
            platform_info: Pre-detected platform info. If None, auto-detects.
        """
        self._platform_info: PlatformInfo = platform_info or detect_platform()
        self._log = logger.bind(
            check_id=self.CHECK_ID,
            check_name=self.CHECK_NAME,
            platform=self._platform_info.platform.value,
        )

    @abstractmethod
    async def run(self) -> CheckResult:
        """Execute the platform-specific security check.

        Must be overridden by each check subclass. Should call the
        appropriate _check_<platform>() helper method based on
        self._platform_info.platform.

        Returns:
            CheckResult with score, details, and recommendations.

        Note:
            Do not call this method directly — use execute() which
            wraps it with timeout, error handling, and timing.
        """
        ...

    @abstractmethod
    def is_supported(self, platform: Platform) -> bool:
        """Return True if this check supports the given platform.

        Args:
            platform: The Platform enum value to check compatibility for.

        Returns:
            True if this check can run on the given platform.
        """
        ...

    async def execute(self) -> CheckResult:
        """Execute the check with timeout enforcement, error handling, and timing.

        This is the public entry point. It wraps run() with:
          1. Platform support check — returns score=1 if unsupported
          2. Timeout enforcement (TIMEOUT_SECONDS) via asyncio.wait_for
          3. Exception catch-all — returns score=1 with error message
          4. Wall-clock duration measurement in milliseconds
          5. Structured logging of check start, completion, and errors

        Returns:
            CheckResult with all fields populated. Score is 1 if the check
            failed or timed out — never raises an exception to the caller.
        """
        start_time = time.monotonic()
        self._log.info("check_started")

        # Platform compatibility gate
        if not self.is_supported(self._platform_info.platform):
            duration_ms = int((time.monotonic() - start_time) * 1000)
            self._log.info(
                "check_skipped_unsupported_platform",
                platform=self._platform_info.platform.value,
                duration_ms=duration_ms,
            )
            return CheckResult(
                check_id=self.CHECK_ID,
                check_name=self.CHECK_NAME,
                platform=self._platform_info.platform.value,
                score=1.0,
                weight=self.WEIGHT,
                details={"reason": f"Check not supported on {self._platform_info.platform.value}"},
                recommendations=[
                    f"This check is not available on {self._platform_info.platform.value}. "
                    "Use an MDM solution to enforce equivalent security policies."
                ],
                duration_ms=duration_ms,
                error=f"Unsupported platform: {self._platform_info.platform.value}",
            )

        try:
            result = await asyncio.wait_for(
                self.run(),
                timeout=float(self.TIMEOUT_SECONDS),
            )
            duration_ms = int((time.monotonic() - start_time) * 1000)
            # Inject timing into result (create updated copy)
            result = result.model_copy(update={"duration_ms": duration_ms})
            self._log.info(
                "check_completed",
                score=result.score,
                passed=result.passed,
                immediate_block=result.immediate_block,
                duration_ms=duration_ms,
            )
            return result

        except asyncio.TimeoutError:
            duration_ms = int((time.monotonic() - start_time) * 1000)
            error_msg = f"Check timed out after {self.TIMEOUT_SECONDS}s"
            self._log.error(
                "check_timeout",
                timeout_seconds=self.TIMEOUT_SECONDS,
                duration_ms=duration_ms,
            )
            return CheckResult(
                check_id=self.CHECK_ID,
                check_name=self.CHECK_NAME,
                platform=self._platform_info.platform.value,
                score=1.0,
                weight=self.WEIGHT,
                details={"reason": "timeout"},
                recommendations=[
                    "Check execution timed out. Verify the system is responsive "
                    "and relevant services are accessible."
                ],
                duration_ms=duration_ms,
                error=error_msg,
            )

        except Exception as exc:  # noqa: BLE001
            duration_ms = int((time.monotonic() - start_time) * 1000)
            error_msg = f"{type(exc).__name__}: {exc}"
            self._log.exception(
                "check_failed",
                error=error_msg,
                duration_ms=duration_ms,
            )
            return CheckResult(
                check_id=self.CHECK_ID,
                check_name=self.CHECK_NAME,
                platform=self._platform_info.platform.value,
                score=1.0,
                weight=self.WEIGHT,
                details={"reason": "exception", "error_type": type(exc).__name__},
                recommendations=[
                    "Check encountered an unexpected error. Review agent logs "
                    "for details and ensure the agent has required system permissions."
                ],
                duration_ms=duration_ms,
                error=error_msg,
            )

    def _make_result(
        self,
        score: float,
        details: dict,
        recommendations: list[str],
        immediate_block: bool = False,
    ) -> CheckResult:
        """Convenience factory for creating a CheckResult from within run().

        Args:
            score: Raw check score (1.0–10.0).
            details: Platform-specific check findings.
            recommendations: Remediation steps.
            immediate_block: Set True only in checks 6, 7, 9 when score=1.

        Returns:
            CheckResult with weight and platform pre-populated.
        """
        return CheckResult(
            check_id=self.CHECK_ID,
            check_name=self.CHECK_NAME,
            platform=self._platform_info.platform.value,
            score=score,
            weight=self.WEIGHT,
            details=details,
            recommendations=recommendations,
            immediate_block=immediate_block,
        )
