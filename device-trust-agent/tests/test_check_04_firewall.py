"""
Tests for Check 04 — Firewall.
"""

from __future__ import annotations

import sys
from unittest.mock import patch

import pytest

from src.checks.check_04_firewall import FirewallCheck


class TestFirewallMeta:
    def test_check_id(self):
        assert FirewallCheck.CHECK_ID == 4

    def test_weight(self):
        assert abs(FirewallCheck.WEIGHT - 0.08) < 1e-9

    def test_not_critical(self):
        assert FirewallCheck.CHECK_ID not in {6, 7, 9}


@pytest.mark.asyncio
class TestFirewallLinux:
    async def test_ufw_default_deny_scores_high(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = FirewallCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=9.0, details="ufw active, default deny inbound")

        with patch.object(FirewallCheck, "run", fake_run):
            result = await check.execute()

        assert result.score >= 8.0

    async def test_no_firewall_scores_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = FirewallCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="no firewall active")

        with patch.object(FirewallCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0

    async def test_exception_falls_back_to_score_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = FirewallCheck()
        with patch.object(FirewallCheck, "run", side_effect=OSError("iptables not found")):
            result = await check.execute()
        assert result.score == 1.0
        assert result.check_id == 4


@pytest.mark.asyncio
class TestFirewallMacOS:
    async def test_pf_and_stealth_scores_high(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = FirewallCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=9.0, details="ALF enabled, stealth mode on, pf active")

        with patch.object(FirewallCheck, "run", fake_run):
            result = await check.execute()

        assert result.score >= 8.0

    async def test_firewall_off_scores_low(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = FirewallCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="Application Firewall disabled")

        with patch.object(FirewallCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0


@pytest.mark.asyncio
class TestFirewallWindows:
    async def test_all_three_profiles_enabled_scores_high(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = FirewallCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=10.0,
                details="Domain=ON, Private=ON, Public=ON"
            )

        with patch.object(FirewallCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0

    async def test_public_profile_off_scores_lower(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = FirewallCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=5.0, details="Domain=ON, Private=ON, Public=OFF")

        with patch.object(FirewallCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 5.0

    async def test_exception_falls_back_to_score_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = FirewallCheck()
        with patch.object(FirewallCheck, "run", side_effect=RuntimeError("netsh unavailable")):
            result = await check.execute()
        assert result.score == 1.0


@pytest.mark.asyncio
class TestFirewallMobile:
    async def test_mdm_enrolled_mobile_scores_7(self, monkeypatch):
        monkeypatch.setenv("MEDTRUSTX_MOBILE_PLATFORM", "ios")
        check = FirewallCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=7.0, details="MDM enrolled, firewall managed")

        with patch.object(FirewallCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 7.0

    async def test_not_enrolled_mobile_scores_1(self, monkeypatch):
        monkeypatch.setenv("MEDTRUSTX_MOBILE_PLATFORM", "android")
        check = FirewallCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="Not MDM enrolled")

        with patch.object(FirewallCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0
