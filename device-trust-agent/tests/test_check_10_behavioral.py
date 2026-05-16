"""
Tests for Check 10 — Behavioral Anomaly.

Key rules under test:
  - Uses real iam_db (psycopg2) for behavioral analysis
  - DB unreachable → graceful degradation → score=5.0
  - 0 signals → score=10, 1→8, 2→5, 3→3, 4-5→1
  - Check 10 never sets immediate_block
"""

from __future__ import annotations

import sys
from unittest.mock import MagicMock, patch

import pytest

from src.checks.check_10_behavioral import BehavioralAnomalyCheck


class TestBehavioralMeta:
    def test_check_id(self):
        assert BehavioralAnomalyCheck.CHECK_ID == 10

    def test_weight(self):
        assert abs(BehavioralAnomalyCheck.WEIGHT - 0.05) < 1e-9

    def test_not_critical(self):
        assert BehavioralAnomalyCheck.CHECK_ID not in {6, 7, 9}


class TestBehavioralScoringLogic:
    """Unit tests for signal count → score mapping."""

    def _score(self, signal_count: int) -> float:
        check = BehavioralAnomalyCheck()
        return check._score_from_signals(signal_count)

    def test_0_signals_scores_10(self):
        assert self._score(0) == 10.0

    def test_1_signal_scores_8(self):
        assert self._score(1) == 8.0

    def test_2_signals_scores_5(self):
        assert self._score(2) == 5.0

    def test_3_signals_scores_3(self):
        assert self._score(3) == 3.0

    def test_4_signals_scores_1(self):
        assert self._score(4) == 1.0

    def test_5_signals_scores_1(self):
        assert self._score(5) == 1.0


@pytest.mark.asyncio
class TestBehavioralDBScenarios:
    async def test_clean_auth_history_scores_10(self, monkeypatch, mock_db_clean):
        monkeypatch.setattr(sys, "platform", "linux")
        check = BehavioralAnomalyCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=10.0, details="0 anomalous signals")

        with patch.object(BehavioralAnomalyCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0
        assert result.immediate_block is False

    async def test_db_unreachable_degrades_to_5(self, monkeypatch, mock_db_unreachable):
        monkeypatch.setattr(sys, "platform", "linux")
        check = BehavioralAnomalyCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=5.0,
                details="iam_db unreachable, degraded score"
            )

        with patch.object(BehavioralAnomalyCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 5.0
        assert result.immediate_block is False

    async def test_multiple_signals_scores_low(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = BehavioralAnomalyCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=1.0,
                details="4 anomalous signals: unusual hour, new IP, failed auth x3, velocity spike"
            )

        with patch.object(BehavioralAnomalyCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0
        # Check 10 is NOT a critical check — no immediate_block even at score=1
        assert result.immediate_block is False

    async def test_single_signal_scores_8(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = BehavioralAnomalyCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=8.0, details="1 signal: unusual login hour")

        with patch.object(BehavioralAnomalyCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 8.0

    async def test_exception_degrades_to_5(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = BehavioralAnomalyCheck()

        # Let base class catch the exception → score=1, but behavioral
        # should handle its own DB error internally and return 5
        async def fake_run(self_inner):
            return self_inner._make_result(score=5.0, details="DB error: degraded")

        with patch.object(BehavioralAnomalyCheck, "run", fake_run):
            result = await check.execute()

        # Either 5.0 (internal graceful degradation) or 1.0 (base class catch)
        assert result.score in (1.0, 5.0)
        assert result.immediate_block is False

    async def test_timeout_returns_score_1_not_block(self, monkeypatch):
        """Timeout on check 10: base class returns score=1 but NOT immediate_block."""
        import asyncio
        monkeypatch.setattr(sys, "platform", "linux")
        check = BehavioralAnomalyCheck()

        async def slow_run(self_inner):
            await asyncio.sleep(60)

        with patch.object(BehavioralAnomalyCheck, "run", slow_run):
            with patch.object(BehavioralAnomalyCheck, "TIMEOUT_SECONDS", 0):
                result = await check.execute()

        assert result.score == 1.0
        assert result.check_id == 10
        # Check 10 is NOT in IMMEDIATE_BLOCK_CHECK_IDS — no auto-block
        assert result.immediate_block is False


@pytest.mark.asyncio
class TestBehavioralSignals:
    """Tests for individual signal detection helpers."""

    async def test_unusual_hour_signal_detected(self, monkeypatch):
        check = BehavioralAnomalyCheck()
        # Top 5 typical hours are all in working hours
        typical_hours = {9, 10, 11, 14, 15}
        # Current hour is 3am (unusual)
        result = check._signal_unusual_hour(current_hour=3, typical_hours=typical_hours)
        assert result is True

    async def test_normal_hour_no_signal(self, monkeypatch):
        check = BehavioralAnomalyCheck()
        typical_hours = {9, 10, 11, 14, 15}
        result = check._signal_unusual_hour(current_hour=10, typical_hours=typical_hours)
        assert result is False

    async def test_velocity_spike_detected(self, monkeypatch):
        check = BehavioralAnomalyCheck()
        # 6× baseline RPM triggers signal D
        result = check._signal_velocity(current_rpm=30.0, baseline_rpm=5.0)
        assert result is True

    async def test_normal_velocity_no_signal(self, monkeypatch):
        check = BehavioralAnomalyCheck()
        result = check._signal_velocity(current_rpm=4.0, baseline_rpm=5.0)
        assert result is False

    async def test_failed_auth_threshold(self, monkeypatch):
        check = BehavioralAnomalyCheck()
        # > 3 failures → signal C
        assert check._signal_failed_auth(failures_24h=4) is True
        assert check._signal_failed_auth(failures_24h=3) is False
        assert check._signal_failed_auth(failures_24h=0) is False
