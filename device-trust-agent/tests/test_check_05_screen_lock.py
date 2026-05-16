"""
Tests for Check 05 — Screen Lock.
"""

from __future__ import annotations

import sys
from unittest.mock import patch

import pytest

from src.checks.check_05_screen_lock import ScreenLockCheck


class TestScreenLockMeta:
    def test_check_id(self):
        assert ScreenLockCheck.CHECK_ID == 5

    def test_weight(self):
        assert abs(ScreenLockCheck.WEIGHT - 0.10) < 1e-9

    def test_not_critical(self):
        assert ScreenLockCheck.CHECK_ID not in {6, 7, 9}


class TestScreenLockScoringLogic:
    """Unit tests for the timeout-to-score mapping."""

    def _score(self, timeout_seconds: int) -> float:
        check = ScreenLockCheck()
        return check._score_from_timeout(timeout_seconds)

    def test_60_seconds_or_less_scores_10(self):
        assert self._score(60) == 10.0
        assert self._score(30) == 10.0
        assert self._score(1) == 10.0

    def test_300_seconds_scores_8(self):
        # ≤ 300s → 8
        assert self._score(300) == 8.0
        assert self._score(120) == 8.0

    def test_900_seconds_scores_5(self):
        # ≤ 900s → 5
        assert self._score(900) == 5.0
        assert self._score(600) == 5.0

    def test_over_900_seconds_scores_3(self):
        assert self._score(901) == 3.0
        assert self._score(3600) == 3.0

    def test_zero_or_disabled_scores_1(self):
        # 0 or None → no screen lock
        assert self._score(0) == 1.0


@pytest.mark.asyncio
class TestScreenLockLinux:
    async def test_gnome_60s_lock_scores_high(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = ScreenLockCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=10.0, details="GNOME lock-delay=60s, lock-enabled=true")

        with patch.object(ScreenLockCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0

    async def test_no_screen_lock_scores_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = ScreenLockCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="screen lock not configured")

        with patch.object(ScreenLockCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0

    async def test_exception_returns_score_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = ScreenLockCheck()
        with patch.object(ScreenLockCheck, "run", side_effect=RuntimeError("gsettings unavailable")):
            result = await check.execute()
        assert result.score == 1.0
        assert result.check_id == 5


@pytest.mark.asyncio
class TestScreenLockMacOS:
    async def test_touch_id_and_30s_lock(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = ScreenLockCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=10.0, details="askForPassword=1, idleTime=30s, Touch ID enabled")

        with patch.object(ScreenLockCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0

    async def test_no_password_on_wake_scores_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = ScreenLockCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="askForPassword=0")

        with patch.object(ScreenLockCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0


@pytest.mark.asyncio
class TestScreenLockWindows:
    async def test_gpo_60s_screensaver_scores_10(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = ScreenLockCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=10.0,
                details="ScreenSaveActive=1, ScreenSaverIsSecure=1, timeout=60s"
            )

        with patch.object(ScreenLockCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0

    async def test_no_screensaver_scores_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = ScreenLockCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="ScreenSaveActive=0")

        with patch.object(ScreenLockCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0


@pytest.mark.asyncio
class TestScreenLockTimeout:
    async def test_timeout_returns_score_1(self, monkeypatch):
        import asyncio
        monkeypatch.setattr(sys, "platform", "linux")
        check = ScreenLockCheck()

        async def slow_run(self_inner):
            await asyncio.sleep(60)

        with patch.object(ScreenLockCheck, "run", slow_run):
            with patch.object(ScreenLockCheck, "TIMEOUT_SECONDS", 0):
                result = await check.execute()

        assert result.score == 1.0
        assert result.immediate_block is False
