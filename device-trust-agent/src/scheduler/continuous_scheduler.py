"""
MedTrustX Device Trust Agent — Continuous Check Scheduler.

Runs all 10 security checks on an adaptive interval (15–120s depending
on trust level), computes the composite score, enforces access policy,
and fans out reports to all 4 targets in parallel.

Check execution: asyncio.gather with semaphore (max 5 concurrent)
Reporting:       asyncio.gather — all 4 reporters run in parallel
Interval:        adaptive based on last trust level
"""

from __future__ import annotations

import asyncio
import time
from datetime import datetime, timezone
from typing import List, Optional

import structlog

from src.checks.base_check import BaseCheck
from src.checks.check_01_os_patch import OsPatchCheck
from src.checks.check_02_antivirus import AntivirusCheck
from src.checks.check_03_disk_encryption import DiskEncryptionCheck
from src.checks.check_04_firewall import FirewallCheck
from src.checks.check_05_screen_lock import ScreenLockCheck
from src.checks.check_06_jailbreak import JailbreakCheck
from src.checks.check_07_certificate import CertificateCheck
from src.checks.check_08_network import NetworkSecurityCheck
from src.checks.check_09_processes import ProcessIntegrityCheck
from src.checks.check_10_behavioral import BehavioralAnomalyCheck
from src.models.check_result import CheckResult
from src.models.trust_level import TrustLevel
from src.models.trust_report import TrustReport
from src.reporting.opa_reporter import OpaReporter
from src.reporting.prometheus_reporter import PrometheusReporter
from src.reporting.siem_reporter import SiemReporter
from src.reporting.zta_reporter import ZtaReporter
from src.scoring.access_policy import AccessPolicyEngine
from src.scoring.score_engine import ScoreEngine

logger = structlog.get_logger(__name__)

# Maximum checks running concurrently
MAX_PARALLEL_CHECKS = 5


class ContinuousScheduler:
    """Runs the device trust check cycle on an adaptive interval.

    The scheduler runs indefinitely (until the process is stopped).
    Each cycle:
      1. Runs all 10 checks (max 5 concurrent, each with 10s timeout)
      2. Computes composite score via ScoreEngine
      3. Classifies trust level and builds access policy
      4. Reports to all 4 targets in parallel
      5. Sleeps for the adaptive interval based on trust level
    """

    def __init__(self) -> None:
        self._score_engine = ScoreEngine()
        self._policy_engine = AccessPolicyEngine()
        self._reporters = [
            ZtaReporter(),
            SiemReporter(),
            PrometheusReporter(),
            OpaReporter(),
        ]
        self._last_trust_level: TrustLevel = TrustLevel.STANDARD
        self._cycle_count: int = 0
        self._semaphore = asyncio.Semaphore(MAX_PARALLEL_CHECKS)

    async def run_forever(self) -> None:
        """Run check cycles indefinitely with adaptive sleep intervals."""
        logger.info("continuous_scheduler_started", max_parallel=MAX_PARALLEL_CHECKS)

        while True:
            cycle_start = time.monotonic()
            self._cycle_count += 1

            try:
                trust_report = await self.run_single_cycle()
                self._last_trust_level = trust_report.trust_level

                elapsed = time.monotonic() - cycle_start
                interval = self._policy_engine.compute_next_check_interval(
                    self._last_trust_level
                )
                sleep_time = max(0.0, interval - elapsed)

                logger.info(
                    "check_cycle_complete",
                    cycle=self._cycle_count,
                    score=trust_report.composite_score,
                    trust_level=trust_report.trust_level.value,
                    elapsed_seconds=round(elapsed, 2),
                    next_check_in=round(sleep_time, 1),
                )

                await asyncio.sleep(sleep_time)

            except asyncio.CancelledError:
                logger.info("continuous_scheduler_cancelled")
                raise
            except Exception as exc:
                logger.exception("check_cycle_unexpected_error", error=str(exc))
                # Back off briefly before retrying to avoid tight failure loops
                await asyncio.sleep(10)

    async def run_single_cycle(self) -> TrustReport:
        """Execute one full check cycle and return the resulting TrustReport."""
        from src.config import get_config
        config = get_config()

        # ── Step 1: Run all 10 checks in parallel (semaphore-limited) ────
        checks = self._build_checks()
        check_results = await self._run_checks_parallel(checks)

        # ── Step 2: Compute composite score ──────────────────────────────
        composite_score, override = self._score_engine.compute(
            check_results, agent_mode=config.agent_mode
        )

        # ── Step 3: Classify trust level and build policy ─────────────────
        trust_level = self._policy_engine.classify(composite_score)
        access_policy = self._policy_engine.build_policy(trust_level)
        next_check_in = self._policy_engine.compute_next_check_interval(trust_level)

        self._policy_engine.log_policy_decision(
            trust_level=trust_level,
            composite_score=composite_score,
            device_id=config.agent_device_id,
            override_applied=override.override_applied,
            override_reason=override.override_reason,
        )

        # ── Step 4: Build TrustReport ─────────────────────────────────────
        trust_report = TrustReport(
            device_id=config.agent_device_id,
            tenant_id=config.agent_tenant_id,
            platform=self._get_platform_name(),
            agent_mode=config.agent_mode,
            agent_version=config.agent_version,
            timestamp=datetime.now(timezone.utc),
            check_results=check_results,
            composite_score=composite_score,
            trust_level=trust_level,
            override_applied=override.override_applied,
            override_reason=override.override_reason,
            access_policy=access_policy,
            next_check_in=next_check_in,
        )

        # ── Step 5: Report to all 4 targets in parallel ───────────────────
        await self._report_parallel(trust_report)

        return trust_report

    async def run_single_check(self, check_id: int) -> Optional[CheckResult]:
        """Run a single check by ID. Used by on-demand handler."""
        check = self._get_check_by_id(check_id)
        if not check:
            logger.warning("single_check_not_found", check_id=check_id)
            return None
        return await check.execute()

    # ── Private helpers ────────────────────────────────────────────────────

    def _build_checks(self) -> List[BaseCheck]:
        """Instantiate all 10 check objects."""
        return [
            OsPatchCheck(),
            AntivirusCheck(),
            DiskEncryptionCheck(),
            FirewallCheck(),
            ScreenLockCheck(),
            JailbreakCheck(),
            CertificateCheck(),
            NetworkSecurityCheck(),
            ProcessIntegrityCheck(),
            BehavioralAnomalyCheck(),
        ]

    def _get_check_by_id(self, check_id: int) -> Optional[BaseCheck]:
        """Return a fresh check instance for the given check_id."""
        check_map = {
            1: OsPatchCheck,
            2: AntivirusCheck,
            3: DiskEncryptionCheck,
            4: FirewallCheck,
            5: ScreenLockCheck,
            6: JailbreakCheck,
            7: CertificateCheck,
            8: NetworkSecurityCheck,
            9: ProcessIntegrityCheck,
            10: BehavioralAnomalyCheck,
        }
        cls = check_map.get(check_id)
        return cls() if cls else None

    async def _run_checks_parallel(
        self, checks: List[BaseCheck]
    ) -> List[CheckResult]:
        """Run all checks concurrently, limited to MAX_PARALLEL_CHECKS at once."""
        async def run_with_semaphore(check: BaseCheck) -> CheckResult:
            async with self._semaphore:
                return await check.execute()

        tasks = [run_with_semaphore(check) for check in checks]
        results = await asyncio.gather(*tasks, return_exceptions=False)
        return list(results)

    async def _report_parallel(self, trust_report: TrustReport) -> None:
        """Dispatch to all 4 reporters simultaneously."""
        tasks = [
            reporter.report_with_retry(
                trust_report,
                max_attempts=3,
                base_backoff=2.0,
            )
            for reporter in self._reporters
        ]
        outcomes = await asyncio.gather(*tasks, return_exceptions=True)

        for reporter, outcome in zip(self._reporters, outcomes):
            if isinstance(outcome, Exception):
                logger.error(
                    "reporter_gather_exception",
                    reporter=reporter.reporter_name,
                    error=str(outcome),
                )

    @staticmethod
    def _get_platform_name() -> str:
        """Return the current platform name string."""
        from src.platform_detector import detect_platform
        return detect_platform().platform.value
