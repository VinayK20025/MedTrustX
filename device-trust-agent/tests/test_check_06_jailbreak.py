"""
Tests for Check 06 — Jailbreak / Root Detection (CRITICAL).

Key absolute rules under test:
  - score=1 MUST set immediate_block=True (enforced by CheckResult model validator)
  - SIP disabled (macOS) → score=1 → immediate_block
  - Kernel tainted (Linux) → score=1 → immediate_block
  - Jailbreak paths present (iOS) → score=1 → immediate_block
"""

from __future__ import annotations

import sys
from unittest.mock import patch

import pytest

from src.checks.check_06_jailbreak import JailbreakCheck
from src.models.check_result import CheckResult


class TestJailbreakMeta:
    def test_check_id(self):
        assert JailbreakCheck.CHECK_ID == 6

    def test_weight(self):
        assert abs(JailbreakCheck.WEIGHT - 0.12) < 1e-9

    def test_is_critical(self):
        assert JailbreakCheck.CHECK_ID in {6, 7, 9}


class TestImmediateBlockRule:
    """The model validator must auto-set immediate_block=True when check_id=6 and score=1."""

    def test_score_1_sets_immediate_block(self):
        result = CheckResult(
            check_id=6,
            check_name="jailbreak",
            score=1.0,
            weight=0.12,
            passed=False,
            immediate_block=False,  # supplied as False — validator must override
            details="SIP disabled",
            duration_ms=10.0,
        )
        assert result.immediate_block is True

    def test_score_above_1_does_not_force_block(self):
        result = CheckResult(
            check_id=6,
            check_name="jailbreak",
            score=5.0,
            weight=0.12,
            passed=False,
            immediate_block=False,
            details="minor issue",
            duration_ms=10.0,
        )
        assert result.immediate_block is False

    def test_score_10_clean(self):
        result = CheckResult(
            check_id=6,
            check_name="jailbreak",
            score=10.0,
            weight=0.12,
            passed=True,
            immediate_block=False,
            details="Secure Boot OK, SIP enabled",
            duration_ms=10.0,
        )
        assert result.immediate_block is False
        assert result.passed is True


@pytest.mark.asyncio
class TestJailbreakMacOS:
    async def test_sip_disabled_triggers_block(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = JailbreakCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="SIP is disabled")

        with patch.object(JailbreakCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0
        assert result.immediate_block is True

    async def test_sip_enabled_clean_scores_10(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = JailbreakCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=10.0,
                details="SIP enabled, Gatekeeper enforced, no suspicious boot-args"
            )

        with patch.object(JailbreakCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0
        assert result.immediate_block is False

    async def test_exception_returns_block(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = JailbreakCheck()
        with patch.object(JailbreakCheck, "run", side_effect=RuntimeError("csrutil unavailable")):
            result = await check.execute()
        assert result.score == 1.0
        assert result.immediate_block is True


@pytest.mark.asyncio
class TestJailbreakLinux:
    async def test_root_process_triggers_block(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = JailbreakCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="agent running as root (uid=0)")

        with patch.object(JailbreakCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0
        assert result.immediate_block is True

    async def test_kernel_tainted_triggers_block(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = JailbreakCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=1.0, details="/proc/sys/kernel/tainted=4096 (unsigned module)"
            )

        with patch.object(JailbreakCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0
        assert result.immediate_block is True

    async def test_clean_linux_scores_10(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = JailbreakCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=10.0,
                details="kernel tainted=0, uid=1000, module.sig_enforce=1"
            )

        with patch.object(JailbreakCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0
        assert result.immediate_block is False


@pytest.mark.asyncio
class TestJailbreakWindows:
    async def test_testsigning_on_triggers_block(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = JailbreakCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="bcdedit testsigning=Yes")

        with patch.object(JailbreakCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0
        assert result.immediate_block is True

    async def test_secure_boot_enabled_scores_high(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = JailbreakCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=10.0,
                details="SecureBoot=Enabled, HVCI=1, testsigning=Off"
            )

        with patch.object(JailbreakCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0
        assert result.immediate_block is False


@pytest.mark.asyncio
class TestJailbreakIOS:
    async def test_jailbreak_path_found_triggers_block(self, monkeypatch):
        monkeypatch.setenv("MEDTRUSTX_MOBILE_PLATFORM", "ios")
        check = JailbreakCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="/Applications/Cydia.app exists")

        with patch.object(JailbreakCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0
        assert result.immediate_block is True

    async def test_clean_ios_scores_high(self, monkeypatch):
        monkeypatch.setenv("MEDTRUSTX_MOBILE_PLATFORM", "ios")
        check = JailbreakCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=9.0, details="No jailbreak indicators found")

        with patch.object(JailbreakCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 9.0
        assert result.immediate_block is False


@pytest.mark.asyncio
class TestJailbreakTimeout:
    async def test_timeout_returns_block(self, monkeypatch):
        """A timeout on check 6 must produce score=1 and immediate_block=True."""
        import asyncio
        monkeypatch.setattr(sys, "platform", "linux")
        check = JailbreakCheck()

        async def slow_run(self_inner):
            await asyncio.sleep(60)

        with patch.object(JailbreakCheck, "run", slow_run):
            with patch.object(JailbreakCheck, "TIMEOUT_SECONDS", 0):
                result = await check.execute()

        assert result.score == 1.0
        assert result.immediate_block is True
