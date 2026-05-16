"""
Tests for AccessPolicyEngine and TrustLevel → AccessPolicy mapping.

Key rules under test:
  - BLOCKED (0–3.0): allowed=[], denied=["*"]
  - RESTRICTED (3.1–6.0): read-only clinical
  - STANDARD (6.1–8.5): read+write clinical
  - TRUSTED (8.6–10.0): full access incl. export + admin
  - from_score() classmethod boundary accuracy
  - next_check_in intervals: TRUSTED=120s, STANDARD=60s, RESTRICTED=30s, BLOCKED=15s
"""

from __future__ import annotations

import pytest

from src.models.trust_level import TrustLevel
from src.models.trust_report import AccessPolicy
from src.scoring.access_policy import AccessPolicyEngine


# ── TrustLevel.from_score() ───────────────────────────────────────────────────

class TestTrustLevelFromScore:
    def test_0_is_blocked(self):
        assert TrustLevel.from_score(0.0) == TrustLevel.BLOCKED

    def test_3_is_blocked(self):
        assert TrustLevel.from_score(3.0) == TrustLevel.BLOCKED

    def test_3_1_is_restricted(self):
        assert TrustLevel.from_score(3.1) == TrustLevel.RESTRICTED

    def test_6_is_restricted(self):
        assert TrustLevel.from_score(6.0) == TrustLevel.RESTRICTED

    def test_6_1_is_standard(self):
        assert TrustLevel.from_score(6.1) == TrustLevel.STANDARD

    def test_8_5_is_standard(self):
        assert TrustLevel.from_score(8.5) == TrustLevel.STANDARD

    def test_8_6_is_trusted(self):
        assert TrustLevel.from_score(8.6) == TrustLevel.TRUSTED

    def test_10_is_trusted(self):
        assert TrustLevel.from_score(10.0) == TrustLevel.TRUSTED


# ── TrustLevel properties ─────────────────────────────────────────────────────

class TestTrustLevelProperties:
    def test_blocked_allows_write_false(self):
        assert TrustLevel.BLOCKED.allows_write is False

    def test_blocked_allows_admin_false(self):
        assert TrustLevel.BLOCKED.allows_admin is False

    def test_blocked_allows_export_false(self):
        assert TrustLevel.BLOCKED.allows_export is False

    def test_restricted_allows_write_false(self):
        assert TrustLevel.RESTRICTED.allows_write is False

    def test_standard_allows_write_true(self):
        assert TrustLevel.STANDARD.allows_write is True

    def test_standard_allows_admin_false(self):
        assert TrustLevel.STANDARD.allows_admin is False

    def test_trusted_allows_write_true(self):
        assert TrustLevel.TRUSTED.allows_write is True

    def test_trusted_allows_admin_true(self):
        assert TrustLevel.TRUSTED.allows_admin is True

    def test_trusted_allows_export_true(self):
        assert TrustLevel.TRUSTED.allows_export is True

    def test_session_durations(self):
        assert TrustLevel.BLOCKED.session_duration_seconds == 0
        assert TrustLevel.RESTRICTED.session_duration_seconds == 3600
        assert TrustLevel.STANDARD.session_duration_seconds == 28800
        assert TrustLevel.TRUSTED.session_duration_seconds == 43200

    def test_siem_severity(self):
        assert TrustLevel.BLOCKED.siem_severity == 0     # Emergency
        assert TrustLevel.RESTRICTED.siem_severity == 4  # Warning
        assert TrustLevel.STANDARD.siem_severity == 5    # Notice
        assert TrustLevel.TRUSTED.siem_severity == 6     # Info

    def test_cef_severity(self):
        assert TrustLevel.BLOCKED.cef_severity == 10    # Critical
        assert TrustLevel.RESTRICTED.cef_severity == 6  # Medium
        assert TrustLevel.STANDARD.cef_severity == 3    # Low
        assert TrustLevel.TRUSTED.cef_severity == 1     # Very Low


# ── AccessPolicy.from_trust_level() ──────────────────────────────────────────

class TestAccessPolicyFromTrustLevel:
    def test_blocked_no_allowed_resources(self):
        policy = AccessPolicy.from_trust_level(TrustLevel.BLOCKED)
        assert policy.allowed_resources == [] or policy.allowed_resources == ()
        assert "*" in policy.denied_resources or "all" in str(policy.denied_resources).lower()

    def test_restricted_read_only(self):
        policy = AccessPolicy.from_trust_level(TrustLevel.RESTRICTED)
        assert policy.can_write is False
        assert policy.can_read is True
        assert policy.can_export is False
        assert policy.can_admin is False

    def test_standard_read_write(self):
        policy = AccessPolicy.from_trust_level(TrustLevel.STANDARD)
        assert policy.can_read is True
        assert policy.can_write is True
        assert policy.can_export is False
        assert policy.can_admin is False

    def test_trusted_full_access(self):
        policy = AccessPolicy.from_trust_level(TrustLevel.TRUSTED)
        assert policy.can_read is True
        assert policy.can_write is True
        assert policy.can_export is True
        assert policy.can_admin is True


# ── AccessPolicyEngine ────────────────────────────────────────────────────────

class TestAccessPolicyEngine:
    def setup_method(self):
        self.engine = AccessPolicyEngine()

    def test_classify_blocked(self):
        assert self.engine.classify(0.0) == TrustLevel.BLOCKED
        assert self.engine.classify(3.0) == TrustLevel.BLOCKED

    def test_classify_restricted(self):
        assert self.engine.classify(3.1) == TrustLevel.RESTRICTED
        assert self.engine.classify(6.0) == TrustLevel.RESTRICTED

    def test_classify_standard(self):
        assert self.engine.classify(6.1) == TrustLevel.STANDARD
        assert self.engine.classify(8.5) == TrustLevel.STANDARD

    def test_classify_trusted(self):
        assert self.engine.classify(8.6) == TrustLevel.TRUSTED
        assert self.engine.classify(10.0) == TrustLevel.TRUSTED

    def test_next_check_interval_blocked(self):
        assert self.engine.compute_next_check_interval(TrustLevel.BLOCKED) == 15

    def test_next_check_interval_restricted(self):
        assert self.engine.compute_next_check_interval(TrustLevel.RESTRICTED) == 30

    def test_next_check_interval_standard(self):
        assert self.engine.compute_next_check_interval(TrustLevel.STANDARD) == 60

    def test_next_check_interval_trusted(self):
        assert self.engine.compute_next_check_interval(TrustLevel.TRUSTED) == 120

    def test_build_policy_returns_access_policy(self):
        policy = self.engine.build_policy(TrustLevel.STANDARD)
        assert isinstance(policy, AccessPolicy)

    def test_log_policy_decision_no_exception(self, caplog):
        """log_policy_decision must not raise and must not call print()."""
        import logging
        with caplog.at_level(logging.WARNING):
            # Should not raise
            self.engine.log_policy_decision(TrustLevel.BLOCKED, composite_score=0.0)
            self.engine.log_policy_decision(TrustLevel.TRUSTED, composite_score=9.5)


# ── OPA document serialisation ────────────────────────────────────────────────

class TestTrustReportOpaDocument:
    def test_to_opa_document_structure(self, standard_trust_report):
        doc = standard_trust_report.to_opa_document()
        assert "device_id" in doc
        assert "composite_score" in doc
        assert "trust_level" in doc
        assert "access_policy" in doc
        assert "checks" in doc
        assert isinstance(doc["checks"], dict)

    def test_to_opa_document_check_keys(self, standard_trust_report):
        doc = standard_trust_report.to_opa_document()
        # Should have OPA-friendly check keys (not integer IDs)
        for key in doc["checks"]:
            assert isinstance(key, str)

    def test_blocked_report_opa_document(self, blocked_trust_report):
        doc = blocked_trust_report.to_opa_document()
        assert doc["trust_level"] == "BLOCKED"
        assert doc["composite_score"] == 0.0
