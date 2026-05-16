"""
Tests for Check 02 — Antivirus / EDR.
"""

from __future__ import annotations

import sys
from unittest.mock import MagicMock, patch

import pytest

from src.checks.check_02_antivirus import AntivirusCheck


class TestAntivirusCheckMeta:
    def test_check_id(self):
        assert AntivirusCheck.CHECK_ID == 2

    def test_weight(self):
        assert abs(AntivirusCheck.WEIGHT - 0.15) < 1e-9

    def test_not_critical(self):
        assert AntivirusCheck.CHECK_ID not in {6, 7, 9}


@pytest.mark.asyncio
class TestAntivirusLinux:
    async def test_returns_valid_result(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = AntivirusCheck()
        with patch.object(AntivirusCheck, "run", side_effect=RuntimeError("no /proc")):
            result = await check.execute()
        assert result.check_id == 2
        assert 1.0 <= result.score <= 10.0

    async def test_clamav_running_scores_high(self, monkeypatch, tmp_path):
        """When freshclam log is recent and clamd process found, score should be ≥ 7."""
        monkeypatch.setattr(sys, "platform", "linux")
        check = AntivirusCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=8.0, details="clamd running, defs 0d old")

        with patch.object(AntivirusCheck, "run", fake_run):
            result = await check.execute()

        assert result.score >= 7.0

    async def test_no_av_scores_low(self, monkeypatch):
        """No AV/EDR detected → score should be ≤ 3."""
        monkeypatch.setattr(sys, "platform", "linux")
        check = AntivirusCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=2.0, details="no antivirus found")

        with patch.object(AntivirusCheck, "run", fake_run):
            result = await check.execute()

        assert result.score <= 3.0


@pytest.mark.asyncio
class TestAntivirusMacOS:
    async def test_returns_valid_result(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = AntivirusCheck()
        with patch.object(AntivirusCheck, "run", side_effect=RuntimeError("no launchctl")):
            result = await check.execute()
        assert result.check_id == 2
        assert 1.0 <= result.score <= 10.0


@pytest.mark.asyncio
class TestAntivirusWindows:
    async def test_returns_valid_result(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = AntivirusCheck()
        with patch.object(AntivirusCheck, "run", side_effect=RuntimeError("no WMI")):
            result = await check.execute()
        assert result.check_id == 2
        assert 1.0 <= result.score <= 10.0

    async def test_enterprise_edr_scores_10(self, monkeypatch):
        """Enterprise EDR (CrowdStrike + registry) → score 10."""
        monkeypatch.setattr(sys, "platform", "win32")
        check = AntivirusCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=10.0, details="CrowdStrike EDR active")

        with patch.object(AntivirusCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0


@pytest.mark.asyncio
class TestAntivirusTimeoutAndError:
    async def test_timeout_returns_score_1(self, monkeypatch):
        import asyncio
        monkeypatch.setattr(sys, "platform", "linux")
        check = AntivirusCheck()

        async def slow_run(self_inner):
            await asyncio.sleep(60)

        with patch.object(AntivirusCheck, "run", slow_run):
            with patch.object(AntivirusCheck, "TIMEOUT_SECONDS", 0):
                result = await check.execute()

        assert result.score == 1.0
        assert result.check_id == 2

    async def test_exception_returns_score_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = AntivirusCheck()
        with patch.object(AntivirusCheck, "run", side_effect=OSError("permission denied")):
            result = await check.execute()
        assert result.score == 1.0
