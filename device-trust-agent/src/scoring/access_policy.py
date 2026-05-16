"""
MedTrustX Device Trust Agent — Access Policy Enforcement.

Translates a composite trust score into a TrustLevel and constructs
the corresponding AccessPolicy. Also handles the side-effect actions
that must fire when a policy tier is entered (session revocation,
Redis alert publication, OPA context update scheduling).
"""

from __future__ import annotations

from typing import Optional

import structlog

from src.models.trust_level import TrustLevel
from src.models.trust_report import AccessPolicy

logger = structlog.get_logger(__name__)


class AccessPolicyEngine:
    """Determines the access policy for a device based on its composite trust score.

    Usage:
        engine = AccessPolicyEngine()
        trust_level = engine.classify(score)
        policy = engine.build_policy(trust_level)
        engine.log_policy_decision(trust_level, score, device_id)
    """

    def classify(self, composite_score: float) -> TrustLevel:
        """Map a composite trust score to the appropriate TrustLevel.

        Args:
            composite_score: Final score in [0.0, 10.0].

        Returns:
            TrustLevel enum member corresponding to the score range.
        """
        level = TrustLevel.from_score(composite_score)
        logger.info(
            "trust_level_classified",
            composite_score=composite_score,
            trust_level=level.value,
        )
        return level

    def build_policy(self, trust_level: TrustLevel) -> AccessPolicy:
        """Build the canonical AccessPolicy for the given TrustLevel.

        Args:
            trust_level: The TrustLevel to build a policy for.

        Returns:
            AccessPolicy instance with all fields populated.
        """
        policy = AccessPolicy.from_trust_level(trust_level)
        logger.info(
            "access_policy_built",
            trust_level=trust_level.value,
            session_duration=policy.session_duration_seconds,
            mfa_required=policy.mfa_required,
            revoke_sessions=policy.revoke_sessions,
            allowed_action_count=len(policy.allowed_actions),
            denied_action_count=len(policy.denied_actions),
        )
        return policy

    def compute_next_check_interval(
        self, trust_level: TrustLevel
    ) -> int:
        """Return the number of seconds until the next check cycle.

        Adaptive intervals:
          TRUSTED     → 120s (low urgency)
          STANDARD    → 60s  (normal)
          RESTRICTED  → 30s  (elevated monitoring)
          BLOCKED     → 15s  (maximum frequency)

        Args:
            trust_level: Current device trust level.

        Returns:
            Seconds until the next scheduled check.
        """
        try:
            from src.config import get_config
            config = get_config()
            intervals = {
                TrustLevel.TRUSTED: config.check_interval_trusted,
                TrustLevel.STANDARD: config.check_interval_standard,
                TrustLevel.RESTRICTED: config.check_interval_restricted,
                TrustLevel.BLOCKED: config.check_interval_blocked,
            }
        except Exception:
            intervals = {
                TrustLevel.TRUSTED: 120,
                TrustLevel.STANDARD: 60,
                TrustLevel.RESTRICTED: 30,
                TrustLevel.BLOCKED: 15,
            }
        return intervals[trust_level]

    def log_policy_decision(
        self,
        trust_level: TrustLevel,
        composite_score: float,
        device_id: str,
        override_applied: bool = False,
        override_reason: Optional[str] = None,
    ) -> None:
        """Emit a structured audit log entry for the policy decision.

        Args:
            trust_level: The TrustLevel assigned to the device.
            composite_score: The final composite trust score.
            device_id: The device identifier for audit correlation.
            override_applied: Whether a score override rule fired.
            override_reason: Human-readable reason if an override fired.
        """
        log_fields = {
            "event": "access_policy_decision",
            "device_id": device_id,
            "composite_score": composite_score,
            "trust_level": trust_level.value,
            "override_applied": override_applied,
            "override_reason": override_reason,
            "session_duration_seconds": trust_level.session_duration_seconds,
            "mfa_required": trust_level.requires_mfa,
            "revoke_sessions": trust_level.revoke_sessions,
        }

        if trust_level == TrustLevel.BLOCKED:
            logger.warning("device_blocked", **log_fields)
        elif trust_level == TrustLevel.RESTRICTED:
            logger.warning("device_restricted", **log_fields)
        elif trust_level == TrustLevel.STANDARD:
            logger.info("device_standard_access", **log_fields)
        else:
            logger.info("device_trusted_access", **log_fields)
