"""
MedTrustX Device Trust Agent — Composite Score Engine.

Computes the final weighted trust score from all 10 check results,
applies override rules, enforces the browser-mode score cap, and
returns the composite score together with the override metadata needed
to populate TrustReport.
"""

from __future__ import annotations

from typing import List, Optional, Tuple

import structlog

from src.models.check_result import CheckResult
from src.scoring.override_rules import OverrideResult, apply_overrides
from src.scoring.weight_config import WEIGHTS

logger = structlog.get_logger(__name__)

# Maximum trust score permitted in browser agent mode
BROWSER_SCORE_CAP = 7.0


class ScoreEngine:
    """Computes the composite device trust score from a list of CheckResult objects.

    Usage:
        engine = ScoreEngine()
        score, override = engine.compute(check_results, agent_mode="native")
    """

    def compute(
        self,
        check_results: List[CheckResult],
        agent_mode: str = "native",
    ) -> Tuple[float, OverrideResult]:
        """Compute the final composite trust score.

        Steps:
          1. Compute weighted average of all check scores.
          2. Apply override rules (immediate-block, behavioral+AV cap).
          3. If agent_mode == "browser", cap score at BROWSER_SCORE_CAP.

        Args:
            check_results: All CheckResult instances from the current cycle.
                           May be fewer than 10 in browser mode.
            agent_mode: "native" or "browser". Browser mode caps at 7.0.

        Returns:
            Tuple of (final_score, OverrideResult).
            final_score is in [0.0, 10.0], rounded to 2 decimal places.
        """
        if not check_results:
            logger.warning("score_engine_no_results")
            empty_override = OverrideResult(
                override_applied=True,
                override_reason="No check results provided.",
                final_score=0.0,
                immediate_block=True,
            )
            return 0.0, empty_override

        # ── Step 1: Weighted average ───────────────────────────────────────
        raw_score = self._compute_weighted_average(check_results)
        logger.debug("raw_weighted_score", raw_score=raw_score)

        # ── Step 2: Override rules ─────────────────────────────────────────
        override = apply_overrides(raw_score, check_results)
        score_after_override = override.final_score
        logger.debug(
            "score_after_override",
            override_applied=override.override_applied,
            score=score_after_override,
        )

        # ── Step 3: Browser mode cap ───────────────────────────────────────
        if agent_mode == "browser" and score_after_override > BROWSER_SCORE_CAP:
            logger.info(
                "browser_score_cap_applied",
                pre_cap=score_after_override,
                cap=BROWSER_SCORE_CAP,
            )
            override = OverrideResult(
                override_applied=True,
                override_reason=(
                    f"Browser agent mode: score capped at {BROWSER_SCORE_CAP} "
                    f"(was {score_after_override:.2f})."
                ),
                final_score=BROWSER_SCORE_CAP,
                immediate_block=override.immediate_block,
            )
            score_after_override = BROWSER_SCORE_CAP

        final = round(score_after_override, 2)
        logger.info(
            "composite_score_computed",
            raw=raw_score,
            final=final,
            override_applied=override.override_applied,
            agent_mode=agent_mode,
        )
        return final, override

    @staticmethod
    def _compute_weighted_average(check_results: List[CheckResult]) -> float:
        """Compute the weighted average of check scores.

        Uses the weight stored on each CheckResult. If checks are missing,
        the missing weight is redistributed proportionally among present checks
        so that the denominator always equals 1.0.

        Args:
            check_results: Non-empty list of CheckResult instances.

        Returns:
            Weighted average as a float in [1.0, 10.0].
        """
        present_ids = {r.check_id for r in check_results}
        total_weight = sum(WEIGHTS.get(r.check_id, r.weight) for r in check_results)

        if total_weight <= 0:
            return 1.0

        weighted_sum = sum(
            r.score * WEIGHTS.get(r.check_id, r.weight)
            for r in check_results
        )

        # Normalise by total present weight so partial check sets score correctly
        raw = weighted_sum / total_weight
        return round(raw, 6)
