"""
MedTrustX Device Trust Agent — Score Override Rules.

Defines and applies override rules that can force the composite trust
score to a lower value regardless of the weighted average. Override
rules are evaluated BEFORE the final score is assigned to a TrustLevel.

Override rules (in evaluation order):
  1. IMMEDIATE_BLOCK  — Check 6, 7, or 9 scored 1.0
     → final_score = 0.0, trust_level = BLOCKED
  2. BEHAVIORAL_AV_CAP — Check 10 scored 1.0 AND Check 2 scored < 5.0
     → final_score = min(raw_score, 2.0)
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from src.models.check_result import CheckResult
from src.scoring.weight_config import IMMEDIATE_BLOCK_CHECK_IDS


@dataclass(frozen=True)
class OverrideResult:
    """Result of evaluating all override rules against a set of check results."""

    override_applied: bool
    override_reason: Optional[str]
    final_score: float
    immediate_block: bool


def apply_overrides(
    raw_score: float,
    check_results: List[CheckResult],
) -> OverrideResult:
    """Evaluate all override rules and return the effective final score.

    Rules are evaluated in order of severity. The first matching rule
    that reduces the score further wins.

    Args:
        raw_score: Weighted average score before override evaluation.
        check_results: List of all CheckResult instances from the check cycle.

    Returns:
        OverrideResult with override_applied, override_reason, and final_score.
    """
    # Build a lookup dict for fast check_id → score access
    scores: dict[int, float] = {r.check_id: r.score for r in check_results}

    # ── Rule 1: Immediate block — checks 6, 7, or 9 scored 1.0 ───────────
    # Also fires if the CheckResult itself has immediate_block=True.
    for result in check_results:
        if result.immediate_block:
            return OverrideResult(
                override_applied=True,
                override_reason=(
                    f"Check {result.check_id} ({result.check_name}) scored 1.0 "
                    "— immediate block triggered."
                ),
                final_score=0.0,
                immediate_block=True,
            )

    # Defensive: also check by score value for IMMEDIATE_BLOCK_CHECK_IDS
    for check_id in IMMEDIATE_BLOCK_CHECK_IDS:
        score = scores.get(check_id)
        if score is not None and score <= 1.0:
            return OverrideResult(
                override_applied=True,
                override_reason=(
                    f"Check {check_id} scored 1.0 "
                    "— immediate block override applied."
                ),
                final_score=0.0,
                immediate_block=True,
            )

    # ── Rule 2: Behavioral + weak AV cap ──────────────────────────────────
    # If Check 10 (Behavioral) = 1.0 AND Check 2 (AV) < 5.0:
    # Cap final_score at 2.0.
    behavioral_score = scores.get(10)
    av_score = scores.get(2)
    if (
        behavioral_score is not None
        and av_score is not None
        and behavioral_score <= 1.0
        and av_score < 5.0
    ):
        capped_score = min(raw_score, 2.0)
        return OverrideResult(
            override_applied=True,
            override_reason=(
                f"Behavioral anomaly score is 1.0 and AV score is {av_score} (<5.0). "
                f"Score capped at 2.0 (was {raw_score:.2f})."
            ),
            final_score=round(capped_score, 2),
            immediate_block=False,
        )

    # No override applied
    return OverrideResult(
        override_applied=False,
        override_reason=None,
        final_score=round(raw_score, 2),
        immediate_block=False,
    )
