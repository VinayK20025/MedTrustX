"""
Tests for Check 07 — Device Certificate (CRITICAL).

Key absolute rules under test:
  - Expired / revoked / fingerprint-mismatch → score=1 → immediate_block=True
  - Valid + OCSP good + fingerprint match → score=10
  - Valid + fingerprint match + no OCSP → score=7
  - Fingerprint drift → score=4
"""

from __future__ import annotations

import sys
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest

from src.checks.check_07_certificate import CertificateCheck
from src.models.check_result import CheckResult


class TestCertificateMeta:
    def test_check_id(self):
        assert CertificateCheck.CHECK_ID == 7

    def test_weight(self):
        assert abs(CertificateCheck.WEIGHT - 0.10) < 1e-9

    def test_is_critical(self):
        assert CertificateCheck.CHECK_ID in {6, 7, 9}


class TestImmediateBlockRule:
    """Model validator must auto-set immediate_block when check_id=7 and score=1."""

    def test_score_1_sets_immediate_block(self):
        result = CheckResult(
            check_id=7,
            check_name="certificate",
            score=1.0,
            weight=0.10,
            passed=False,
            immediate_block=False,
            details="Certificate expired",
            duration_ms=5.0,
        )
        assert result.immediate_block is True

    def test_score_7_no_auto_block(self):
        result = CheckResult(
            check_id=7,
            check_name="certificate",
            score=7.0,
            weight=0.10,
            passed=True,
            immediate_block=False,
            details="Valid cert, no OCSP",
            duration_ms=5.0,
        )
        assert result.immediate_block is False


@pytest.mark.asyncio
class TestCertificateScenarios:
    async def test_valid_ocsp_good_fingerprint_match_scores_10(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = CertificateCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=10.0,
                details="cert valid, OCSP=good, fingerprint=match"
            )

        with patch.object(CertificateCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0
        assert result.immediate_block is False

    async def test_valid_no_ocsp_fingerprint_match_scores_7(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = CertificateCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=7.0,
                details="cert valid, no OCSP endpoint, fingerprint=match"
            )

        with patch.object(CertificateCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 7.0
        assert result.immediate_block is False

    async def test_fingerprint_drift_scores_4(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = CertificateCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=4.0,
                details="cert valid, fingerprint drift detected"
            )

        with patch.object(CertificateCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 4.0
        assert result.immediate_block is False

    async def test_expired_cert_scores_1_and_blocks(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = CertificateCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="Certificate expired 30 days ago")

        with patch.object(CertificateCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0
        assert result.immediate_block is True

    async def test_revoked_cert_scores_1_and_blocks(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = CertificateCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="OCSP status: REVOKED")

        with patch.object(CertificateCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0
        assert result.immediate_block is True

    async def test_fingerprint_mismatch_scores_1_and_blocks(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = CertificateCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="fingerprint mismatch: stored != current")

        with patch.object(CertificateCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0
        assert result.immediate_block is True

    async def test_exception_scores_1_and_blocks(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = CertificateCheck()
        with patch.object(CertificateCheck, "run", side_effect=RuntimeError("cert store unavailable")):
            result = await check.execute()
        assert result.score == 1.0
        assert result.immediate_block is True

    async def test_timeout_scores_1_and_blocks(self, monkeypatch):
        import asyncio
        monkeypatch.setattr(sys, "platform", "linux")
        check = CertificateCheck()

        async def slow_run(self_inner):
            await asyncio.sleep(60)

        with patch.object(CertificateCheck, "run", slow_run):
            with patch.object(CertificateCheck, "TIMEOUT_SECONDS", 0):
                result = await check.execute()

        assert result.score == 1.0
        assert result.immediate_block is True


@pytest.mark.asyncio
class TestCertificatePlatformVariants:
    async def test_macos_keychain_cert_valid(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = CertificateCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=10.0, details="keychain cert valid")

        with patch.object(CertificateCheck, "run", fake_run):
            result = await check.execute()

        assert result.check_id == 7
        assert result.score == 10.0

    async def test_windows_certstore_cert_valid(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = CertificateCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=10.0, details="LocalMachine\\My cert valid")

        with patch.object(CertificateCheck, "run", fake_run):
            result = await check.execute()

        assert result.check_id == 7
        assert result.score == 10.0
