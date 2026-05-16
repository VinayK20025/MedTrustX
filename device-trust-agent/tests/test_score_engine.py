"""
Tests for ScoreEngine and weight configuration.

Key absolute rules under test:
  - Weights sum to exactly 1.0
  - Weighted average computed correctly
  - Immediate block → composite = 0.0
  - Browser mode caps at 7.0
  - Partial check sets normalise by present weight
"""

from __future__ import annotations

import pytest

from src.scoring.weight_config import WEIGHTS, IMMEDIATE_BLOCK_CHECK_IDS
from src.scoring.score_engine import ScoreEngine
from src.models.check_result import CheckResult


# ── Weight integrity ──────────────────────────────────────────────────────────

class TestWeightConfig:
    def test_weights_sum_to_1(self):
        total = sum(WEIGHTS.values())
        assert abs(total - 1.0) < 1e-9, f"Weights sum to {total}, expected 1.0"

    def test_10_checks_defined(self):
        assert len(WEIGHTS) == 10

    def test_all_check_ids_1_to_10(self):
        assert set(WEIGHTS.keys()) == set(range(1, 11))

    def test_no_negative_weights(self):
        for check_id, w in WEIGHTS.items():
            assert w > 0, f"Weight for check {check_id} must be positive"

    def test_immediate_block_ids(self):
        assert IMMEDIATE_BLOCK_CHECK_IDS == frozenset({6, 7, 9})

    def test_check_6_weight(self):
        assert abs(WEIGHTS[6] - 0.12) < 1e-9

    def test_check_7_weight(self):
        assert abs(WEIGHTS[7] - 0.10) < 1e-9

    def test_check_9_weight(self):
        assert abs(WEIGHTS[9] - 0.07) < 1e-9


# ── ScoreEngine.compute() ─────────────────────────────────────────────────────

def _make_result(check_id: int, score: float, immediate_block: bool = False) -> CheckResult:
    return CheckResult(
        check_id=check_id,
        check_name=f"check_{check_id:02d}",
        score=score,
        weight=WEIGHTS[check_id],
        passed=score >= 6.0,
        immediate_block=immediate_block,
        details=f"score={score}",
        duration_ms=10.0,
    )


def _all_results(score: float) -> list:
    return [_make_result(i, score) for i in range(1, 11)]


class TestScoreEngineBasic:
    def test_all_10s_returns_10(self):
        results = _all_results(10.0)
        engine = ScoreEngine()
        composite, override = engine.compute(results, browser_mode=False)
        assert abs(composite - 10.0) < 1e-6

    def test_all_1s_returns_1(self):
        results = _all_results(1.0)
        # check 6/7/9 will have immediate_block — override kicks in
        engine = ScoreEngine()
        composite, override = engine.compute(results, browser_mode=False)
        assert composite == 0.0  # override rule 1: immediate block

    def test_mixed_scores_weighted_average(self):
        # All checks score 5.0 except check 1 which scores 10.0
        results = _all_results(5.0)
        results[0] = _make_result(1, 10.0)  # check 1, weight=0.15

        # Expected: weighted avg of (10*0.15 + 5*0.85) = 1.5 + 4.25 = 5.75
        engine = ScoreEngine()
        composite, override = engine.compute(results, browser_mode=False)
        # No immediate block (check 6/7/9 score=5.0, not 1.0)
        assert abs(composite - 5.75) < 0.01

    def test_browser_cap_at_7(self):
        results = _all_results(10.0)
        engine = ScoreEngine()
        composite, override = engine.compute(results, browser_mode=True)
        assert composite <= 7.0

    def test_browser_cap_leaves_low_scores_unchanged(self):
        results = _all_results(5.0)
        # check 6/7/9 at 5.0 do NOT trigger immediate_block
        engine = ScoreEngine()
        composite, override = engine.compute(results, browser_mode=True)
        # The score is ~5.0; cap at 7 doesn't change it
        assert composite <= 7.0
        assert composite >= 1.0


class TestScoreEngineImmediateBlock:
    def test_check_6_score_1_zeroes_composite(self):
        results = _all_results(10.0)
        # Override check 6 to score=1 with immediate_block=True
        results[5] = CheckResult(
            check_id=6, check_name="jailbreak", score=1.0, weight=0.12,
            passed=False, immediate_block=True, details="SIP disabled", duration_ms=5.0,
        )
        engine = ScoreEngine()
        composite, override = engine.compute(results, browser_mode=False)
        assert composite == 0.0
        assert override.applied is True

    def test_check_7_score_1_zeroes_composite(self):
        results = _all_results(10.0)
        results[6] = CheckResult(
            check_id=7, check_name="certificate", score=1.0, weight=0.10,
            passed=False, immediate_block=True, details="expired", duration_ms=5.0,
        )
        engine = ScoreEngine()
        composite, override = engine.compute(results, browser_mode=False)
        assert composite == 0.0
        assert override.applied is True

    def test_check_9_score_1_zeroes_composite(self):
        results = _all_results(10.0)
        results[8] = CheckResult(
            check_id=9, check_name="processes", score=1.0, weight=0.07,
            passed=False, immediate_block=True, details="mimikatz detected", duration_ms=5.0,
        )
        engine = ScoreEngine()
        composite, override = engine.compute(results, browser_mode=False)
        assert composite == 0.0
        assert override.applied is True

    def test_non_critical_score_1_does_not_zero_composite(self):
        """Check 1 at score=1 does NOT trigger an immediate block."""
        results = _all_results(10.0)
        results[0] = _make_result(1, 1.0, immediate_block=False)
        engine = ScoreEngine()
        composite, override = engine.compute(results, browser_mode=False)
        assert composite > 0.0
        assert override.applied is False


class TestScoreEnginePartialResults:
    def test_partial_results_normalise_by_present_weight(self):
        """If only checks 1 and 2 are present (browser-like subset), normalise correctly."""
        results = [
            _make_result(1, 8.0),   # weight=0.15
            _make_result(2, 6.0),   # weight=0.15
        ]
        engine = ScoreEngine()
        composite, override = engine.compute(results, browser_mode=True)
        # Expected: (8*0.15 + 6*0.15) / (0.15+0.15) = 1.2+0.9 / 0.30 = 7.0
        assert abs(composite - 7.0) < 0.01

    def test_single_result_equals_that_score(self):
        results = [_make_result(1, 7.5)]
        engine = ScoreEngine()
        composite, _ = engine.compute(results, browser_mode=False)
        assert abs(composite - 7.5) < 0.01


class TestScoreEngineOverrideRule2:
    def test_behavioral_low_and_av_low_caps_at_2(self):
        """Rule 2: behavioral≤1 AND antivirus<5 → min(raw, 2.0)."""
        results = _all_results(8.0)
        results[9] = _make_result(10, 1.0)  # behavioral score=1
        results[1] = _make_result(2, 4.0)   # antivirus score=4 (< 5)
        # Checks 6/7/9 are 8.0 so no immediate block
        engine = ScoreEngine()
        composite, override = engine.compute(results, browser_mode=False)
        assert composite <= 2.0
        assert override.applied is True
