"""
Tests for Check 08 — Network Security.
"""

from __future__ import annotations

import sys
from unittest.mock import patch

import pytest

from src.checks.check_08_network import NetworkSecurityCheck


class TestNetworkMeta:
    def test_check_id(self):
        assert NetworkSecurityCheck.CHECK_ID == 8

    def test_weight(self):
        assert abs(NetworkSecurityCheck.WEIGHT - 0.08) < 1e-9

    def test_not_critical(self):
        assert NetworkSecurityCheck.CHECK_ID not in {6, 7, 9}


class TestNetworkIpClassification:
    """Unit tests for corporate IP range detection."""

    def _is_corporate(self, ip: str) -> bool:
        import ipaddress
        check = NetworkSecurityCheck()
        return check._is_corporate_ip(ip)

    def test_10_0_0_1_is_corporate(self):
        assert self._is_corporate("10.0.0.1") is True

    def test_10_255_255_255_is_corporate(self):
        assert self._is_corporate("10.255.255.255") is True

    def test_192_168_not_corporate(self):
        # Default corp range is 10.0.0.0/8 only
        assert self._is_corporate("192.168.1.1") is False

    def test_public_ip_not_corporate(self):
        assert self._is_corporate("8.8.8.8") is False


@pytest.mark.asyncio
class TestNetworkScenarios:
    async def test_corporate_vpn_wpa3_scores_10(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = NetworkSecurityCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=10.0,
                details="corporate IP=10.1.2.3, VPN=wg0 active, WiFi=WPA3, DNS approved"
            )

        with patch.object(NetworkSecurityCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0

    async def test_corporate_wpa2_dns_ok_scores_8(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = NetworkSecurityCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=8.0,
                details="corporate IP, WiFi=WPA2, DNS=approved"
            )

        with patch.object(NetworkSecurityCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 8.0

    async def test_vpn_only_scores_6(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = NetworkSecurityCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=6.0,
                details="VPN=tun0 active, public IP, no WiFi"
            )

        with patch.object(NetworkSecurityCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 6.0

    async def test_public_wpa2_scores_4(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = NetworkSecurityCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=4.0, details="public IP, WiFi=WPA2")

        with patch.object(NetworkSecurityCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 4.0

    async def test_open_wifi_scores_2(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = NetworkSecurityCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=2.0, details="open WiFi, no encryption")

        with patch.object(NetworkSecurityCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 2.0

    async def test_threat_ip_scores_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = NetworkSecurityCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(
                score=1.0,
                details="source IP 1.2.3.4 found in threat_logs"
            )

        with patch.object(NetworkSecurityCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0

    async def test_exception_returns_score_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = NetworkSecurityCheck()
        with patch.object(NetworkSecurityCheck, "run", side_effect=OSError("netifaces unavailable")):
            result = await check.execute()
        assert result.score == 1.0
        assert result.immediate_block is False

    async def test_timeout_returns_score_1(self, monkeypatch):
        import asyncio
        monkeypatch.setattr(sys, "platform", "linux")
        check = NetworkSecurityCheck()

        async def slow_run(self_inner):
            await asyncio.sleep(60)

        with patch.object(NetworkSecurityCheck, "run", slow_run):
            with patch.object(NetworkSecurityCheck, "TIMEOUT_SECONDS", 0):
                result = await check.execute()

        assert result.score == 1.0
        assert result.check_id == 8
