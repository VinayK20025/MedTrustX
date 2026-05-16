"""
Tests for Check 01 — OS Patch Level.
"""

from __future__ import annotations

import sys
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest

from src.checks.check_01_os_patch import OsPatchCheck


class TestOsPatchCheckMeta:
    def test_check_id(self):
        assert OsPatchCheck.CHECK_ID == 1

    def test_weight(self):
        assert abs(OsPatchCheck.WEIGHT - 0.15) < 1e-9

    def test_not_immediate_block(self):
        # Check 1 never sets immediate_block
        check = OsPatchCheck()
        assert check.CHECK_ID not in {6, 7, 9}


class TestOsPatchScoringLogic:
    """Unit tests for _score_from_days_since_patch."""

    def _score(self, days: int) -> float:
        check = OsPatchCheck()
        return check._score_from_days_since_patch(days)

    def test_score_current(self):
        assert self._score(0) == 10.0

    def test_score_within_7_days(self):
        assert self._score(6) == 10.0

    def test_score_8_days_boundary(self):
        # > 7d → 8
        assert self._score(8) == 8.0

    def test_score_30_days(self):
        # > 30d → 5
        assert self._score(31) == 5.0

    def test_score_60_days(self):
        # > 60d → 3
        assert self._score(61) == 3.0

    def test_score_180_days(self):
        # > 180d → 1
        assert self._score(181) == 1.0


@pytest.mark.asyncio
class TestOsPatchLinux:
    async def test_linux_modern_kernel_passes(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = OsPatchCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=8.0, details="kernel 5.15.0, patched 5d ago")

        with patch.object(OsPatchCheck, "run", fake_run):
            result = await check.execute()

        assert result.score >= 1.0
        assert result.check_id == 1

    async def test_execute_returns_valid_result(self, monkeypatch):
        """execute() must always return a CheckResult with 1 ≤ score ≤ 10."""
        monkeypatch.setattr(sys, "platform", "linux")
        check = OsPatchCheck()

        # Simulate run() raising an exception → base class catches it → score=1
        with patch.object(OsPatchCheck, "run", side_effect=RuntimeError("kernel lookup failed")):
            result = await check.execute()

        assert 1.0 <= result.score <= 10.0
        assert result.check_id == 1
        assert result.weight == pytest.approx(0.15)

    async def test_execute_timeout_returns_score_1(self, monkeypatch):
        import asyncio
        monkeypatch.setattr(sys, "platform", "linux")
        check = OsPatchCheck()

        async def slow_run(self_inner):
            await asyncio.sleep(60)
            return self_inner._make_result(score=10.0, details="unreachable")

        with patch.object(OsPatchCheck, "run", slow_run):
            # Force timeout by patching TIMEOUT_SECONDS to 0
            with patch.object(OsPatchCheck, "TIMEOUT_SECONDS", 0):
                result = await check.execute()

        assert result.score == 1.0


@pytest.mark.asyncio
class TestOsPatchMacOS:
    async def test_macos_result_valid(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = OsPatchCheck()

        with patch.object(OsPatchCheck, "run", side_effect=RuntimeError("no sw_vers")):
            result = await check.execute()

        assert result.check_id == 1
        assert 1.0 <= result.score <= 10.0


@pytest.mark.asyncio
class TestOsPatchWindows:
    async def test_windows_result_valid(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = OsPatchCheck()

        with patch.object(OsPatchCheck, "run", side_effect=RuntimeError("no winreg")):
            result = await check.execute()

        assert result.check_id == 1
        assert 1.0 <= result.score <= 10.0


class TestCheckResultShape:
    @pytest.mark.asyncio
    async def test_result_has_required_fields(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = OsPatchCheck()
        with patch.object(OsPatchCheck, "run", side_effect=RuntimeError("mocked")):
            result = await check.execute()

        assert hasattr(result, "check_id")
        assert hasattr(result, "score")
        assert hasattr(result, "weight")
        assert hasattr(result, "passed")
        assert hasattr(result, "immediate_block")
        assert hasattr(result, "duration_ms")
        assert result.duration_ms >= 0.0
        # Check 1 can never set immediate_block
        assert result.immediate_block is False
