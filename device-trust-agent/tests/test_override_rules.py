"""
Tests for override_rules.apply_overrides().

Covers:
  Rule 1: immediate_block flag OR score≤1 on check 6/7/9 → final=0.0
  Rule 2: behavioral_score≤1 AND av_score<5 → min(raw, 2.0)
  No override: clean results pass through unchanged
"""

from __future__ import annotations

import pytest

from src.scoring.override_rules import apply_overrides, OverrideResult
from src.models.check_result import CheckResult
from src.scoring.weight_config import WEIGHTS


def _r(check_id: int, score: float, immediate_block: bool = False) -> CheckResult:
    return CheckResult(
        check_id=check_id,
        check_name=f"check_{check_id:02d}",
        score=score,
        weight=WEIGHTS[check_id],
        passed=score >= 6.0,
        immediate_block=immediate_block,
        details="",
        duration_ms=1.0,
    )


def _all(score: float) -> list:
    return [_r(i, score) for i in range(1, 11)]


class TestOverrideRule1ImmediateBlock:
    def test_check_6_immediate_block_flag_zeroes_score(self):
        results = _all(9.0)
        results[5] = CheckResult(
            check_id=6, check_name="jailbreak", score=1.0, weight=0.12,
            passed=False, immediate_block=True, details="SIP off", duration_ms=1.0,
        )
        override = apply_overrides(raw_score=8.5, check_results=results)
        assert override.applied is True
        assert override.final_score == 0.0
        assert "immediate_block" in override.reason.lower() or "check_06" in override.reason

    def test_check_7_immediate_block_zeroes_score(self):
        results = _all(9.0)
        results[6] = CheckResult(
            check_id=7, check_name="certificate", score=1.0, weight=0.10,
            passed=False, immediate_block=True, details="expired", duration_ms=1.0,
        )
        override = apply_overrides(raw_score=8.5, check_results=results)
        assert override.final_score == 0.0
        assert override.applied is True

    def test_check_9_immediate_block_zeroes_score(self):
        results = _all(9.0)
        results[8] = CheckResult(
            check_id=9, check_name="processes", score=1.0, weight=0.07,
            passed=False, immediate_block=True, details="malware", duration_ms=1.0,
        )
        override = apply_overrides(raw_score=8.5, check_results=results)
        assert override.final_score == 0.0
        assert override.applied is True

    def test_non_critical_immediate_block_false_does_not_zero(self):
        """Check 1 at score=1 with immediate_block=False must NOT trigger rule 1."""
        results = _all(9.0)
        results[0] = _r(1, 1.0, immediate_block=False)
        override = apply_overrides(raw_score=8.0, check_results=results)
        # Rule 1 should not fire — check 1 is not a critical check
        assert override.final_score > 0.0

    def test_critical_score_1_without_flag_still_zeroes(self):
        """Even if immediate_block=False (shouldn't happen), score≤1 on check 6 triggers rule 1."""
        results = _all(9.0)
        # Bypass model validator by directly constructing with score=1
        results[5] = CheckResult(
            check_id=6, check_name="jailbreak", score=1.0, weight=0.12,
            passed=False, immediate_block=True,  # validator forces this
            details="forced block", duration_ms=1.0,
        )
        override = apply_overrides(raw_score=8.5, check_results=results)
        assert override.final_score == 0.0

    def test_rule_1_overrides_any_raw_score(self):
        """Rule 1 fires regardless of raw_score value."""
        results = _all(9.0)
        results[5] = CheckResult(
            check_id=6, check_name="jailbreak", score=1.0, weight=0.12,
            passed=False, immediate_block=True, details="", duration_ms=1.0,
        )
        for raw in [0.5, 3.0, 6.0, 9.9]:
            override = apply_overrides(raw_score=raw, check_results=results)
            assert override.final_score == 0.0, f"Expected 0.0 for raw_score={raw}"


class TestOverrideRule2BehavioralPlusAV:
    def test_behavioral_1_and_av_below_5_caps_at_2(self):
        results = _all(8.0)
        results[1] = _r(2, 4.0)   # AV score = 4 (< 5)
        results[9] = _r(10, 1.0)  # behavioral score = 1
        raw_score = 7.5
        override = apply_overrides(raw_score=raw_score, check_results=results)
        assert override.applied is True
        assert override.final_score <= 2.0

    def test_behavioral_1_and_av_exactly_5_does_not_trigger(self):
        results = _all(8.0)
        results[1] = _r(2, 5.0)   # AV score = 5 (boundary — rule requires < 5)
        results[9] = _r(10, 1.0)
        override = apply_overrides(raw_score=7.5, check_results=results)
        # Rule 2 should NOT fire since AV=5 is not < 5
        assert override.applied is False

    def test_behavioral_2_and_av_low_does_not_trigger(self):
        """Rule 2 requires behavioral≤1 specifically."""
        results = _all(8.0)
        results[1] = _r(2, 4.0)
        results[9] = _r(10, 2.0)  # behavioral = 2, not ≤ 1
        override = apply_overrides(raw_score=7.5, check_results=results)
        assert override.applied is False

    def test_rule2_raw_below_2_unchanged(self):
        """If raw_score is already ≤ 2.0, rule 2 does not change it."""
        results = _all(8.0)
        results[1] = _r(2, 4.0)
        results[9] = _r(10, 1.0)
        override = apply_overrides(raw_score=1.5, check_results=results)
        assert override.applied is True
        assert override.final_score == 1.5  # min(1.5, 2.0) = 1.5


class TestNoOverride:
    def test_clean_high_scores_pass_through(self):
        results = _all(9.0)
        override = apply_overrides(raw_score=9.0, check_results=results)
        assert override.applied is False
        assert abs(override.final_score - 9.0) < 1e-9

    def test_override_result_is_frozen(self):
        results = _all(9.0)
        override = apply_overrides(raw_score=9.0, check_results=results)
        # OverrideResult should be a frozen dataclass (no mutation after creation)
        with pytest.raises((AttributeError, TypeError)):
            override.final_score = 5.0  # type: ignore[misc]
