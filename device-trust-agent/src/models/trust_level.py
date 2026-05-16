"""
MedTrustX Device Trust Agent — Trust Level Enumeration.

Defines the four discrete trust levels that map composite trust scores
to access policy decisions. Provides score-range lookup, OPA policy
string values, SIEM severity mappings, and human-readable descriptions.
"""

from __future__ import annotations

from enum import Enum
from typing import Tuple


class TrustLevel(str, Enum):
    """Four-tier trust classification for device access policy enforcement.

    Score ranges:
        BLOCKED:    0.0 – 3.0  (hard deny, all sessions revoked)
        RESTRICTED: 3.1 – 6.0  (read-only, step-up MFA required)
        STANDARD:   6.1 – 8.5  (normal role-based access)
        TRUSTED:    8.6 – 10.0 (full access, extended session)
    """

    BLOCKED = "BLOCKED"
    RESTRICTED = "RESTRICTED"
    STANDARD = "STANDARD"
    TRUSTED = "TRUSTED"

    # ── Score range boundaries ─────────────────────────────────────────────

    @property
    def score_range(self) -> Tuple[float, float]:
        """Return (min_inclusive, max_inclusive) score range for this level."""
        ranges = {
            TrustLevel.BLOCKED: (0.0, 3.0),
            TrustLevel.RESTRICTED: (3.1, 6.0),
            TrustLevel.STANDARD: (6.1, 8.5),
            TrustLevel.TRUSTED: (8.6, 10.0),
        }
        return ranges[self]

    @classmethod
    def from_score(cls, score: float) -> "TrustLevel":
        """Classify a composite trust score into the appropriate TrustLevel.

        Args:
            score: Composite trust score in range [0.0, 10.0].

        Returns:
            The corresponding TrustLevel enum member.
        """
        if score <= 3.0:
            return cls.BLOCKED
        if score <= 6.0:
            return cls.RESTRICTED
        if score <= 8.5:
            return cls.STANDARD
        return cls.TRUSTED

    # ── SIEM / CEF severity mapping ────────────────────────────────────────

    @property
    def siem_severity(self) -> int:
        """RFC 5424 syslog severity level for SIEM integration.

        BLOCKED    → Emergency (0)
        RESTRICTED → Warning   (4)
        STANDARD   → Notice    (5)
        TRUSTED    → Informational (6)
        """
        mapping = {
            TrustLevel.BLOCKED: 0,
            TrustLevel.RESTRICTED: 4,
            TrustLevel.STANDARD: 5,
            TrustLevel.TRUSTED: 6,
        }
        return mapping[self]

    @property
    def siem_severity_label(self) -> str:
        """Human-readable RFC 5424 severity label."""
        labels = {
            TrustLevel.BLOCKED: "Emergency",
            TrustLevel.RESTRICTED: "Warning",
            TrustLevel.STANDARD: "Notice",
            TrustLevel.TRUSTED: "Informational",
        }
        return labels[self]

    @property
    def cef_severity(self) -> int:
        """ArcSight CEF severity (0–10 scale).

        Maps to standard CEF severity levels used by Splunk and other SIEMs.
        """
        mapping = {
            TrustLevel.BLOCKED: 10,
            TrustLevel.RESTRICTED: 6,
            TrustLevel.STANDARD: 3,
            TrustLevel.TRUSTED: 1,
        }
        return mapping[self]

    # ── OPA policy context values ──────────────────────────────────────────

    @property
    def opa_trust_level(self) -> str:
        """String value used in OPA device context data document."""
        return self.value.lower()

    # ── Session and policy attributes ─────────────────────────────────────

    @property
    def session_duration_seconds(self) -> int:
        """Standard session duration granted at this trust level.

        BLOCKED:    0 seconds  (no session granted)
        RESTRICTED: 3600 seconds (1 hour — read-only session)
        STANDARD:   28800 seconds (8 hours)
        TRUSTED:    43200 seconds (12 hours)
        """
        durations = {
            TrustLevel.BLOCKED: 0,
            TrustLevel.RESTRICTED: 3600,
            TrustLevel.STANDARD: 28800,
            TrustLevel.TRUSTED: 43200,
        }
        return durations[self]

    @property
    def requires_mfa(self) -> bool:
        """Whether step-up MFA is required at this trust level."""
        return self in (TrustLevel.BLOCKED, TrustLevel.RESTRICTED)

    @property
    def revoke_sessions(self) -> bool:
        """Whether existing sessions must be revoked at this trust level."""
        return self == TrustLevel.BLOCKED

    @property
    def description(self) -> str:
        """Human-readable description of the trust level and its implications."""
        descriptions = {
            TrustLevel.BLOCKED: (
                "Device has failed critical security checks. All active sessions "
                "have been revoked and access is denied. Immediate remediation required."
            ),
            TrustLevel.RESTRICTED: (
                "Device has marginal security posture. Access is limited to read-only "
                "clinical data. Write, admin, and export operations are blocked. "
                "Step-up MFA is required."
            ),
            TrustLevel.STANDARD: (
                "Device meets baseline security requirements. Normal role-based access "
                "is granted with standard session duration of 8 hours."
            ),
            TrustLevel.TRUSTED: (
                "Device exceeds security baseline. Full access including elevated "
                "operations is granted with extended session duration of 12 hours. "
                "Step-up MFA is waived for low-risk operations."
            ),
        }
        return descriptions[self]

    # ── Convenience predicates ─────────────────────────────────────────────

    @property
    def is_blocked(self) -> bool:
        return self == TrustLevel.BLOCKED

    @property
    def is_restricted(self) -> bool:
        return self == TrustLevel.RESTRICTED

    @property
    def is_standard(self) -> bool:
        return self == TrustLevel.STANDARD

    @property
    def is_trusted(self) -> bool:
        return self == TrustLevel.TRUSTED

    @property
    def allows_write(self) -> bool:
        """Whether write operations are permitted at this trust level."""
        return self in (TrustLevel.STANDARD, TrustLevel.TRUSTED)

    @property
    def allows_admin(self) -> bool:
        """Whether administrative operations are permitted at this trust level."""
        return self == TrustLevel.TRUSTED

    @property
    def allows_export(self) -> bool:
        """Whether data export operations are permitted at this trust level."""
        return self == TrustLevel.TRUSTED
