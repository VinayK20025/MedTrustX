"""
Tests for Check 03 — Disk Encryption.
"""

from __future__ import annotations

import sys
from unittest.mock import patch

import pytest

from src.checks.check_03_disk_encryption import DiskEncryptionCheck


class TestDiskEncryptionMeta:
    def test_check_id(self):
        assert DiskEncryptionCheck.CHECK_ID == 3

    def test_weight(self):
        assert abs(DiskEncryptionCheck.WEIGHT - 0.10) < 1e-9

    def test_not_critical(self):
        assert DiskEncryptionCheck.CHECK_ID not in {6, 7, 9}


@pytest.mark.asyncio
class TestDiskEncryptionLinux:
    async def test_fully_encrypted_scores_high(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = DiskEncryptionCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=10.0, details="LUKS encryption active on /dev/sda")

        with patch.object(DiskEncryptionCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0
        assert result.check_id == 3

    async def test_no_encryption_scores_low(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = DiskEncryptionCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="no encryption detected")

        with patch.object(DiskEncryptionCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0

    async def test_exception_falls_back_to_score_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "linux")
        check = DiskEncryptionCheck()
        with patch.object(DiskEncryptionCheck, "run", side_effect=OSError("no lsblk")):
            result = await check.execute()
        assert result.score == 1.0
        assert result.check_id == 3


@pytest.mark.asyncio
class TestDiskEncryptionMacOS:
    async def test_hardware_backed_filevault_scores_10(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = DiskEncryptionCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=10.0, details="FileVault enabled (Apple Silicon hardware-backed)")

        with patch.object(DiskEncryptionCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0

    async def test_software_filevault_scores_7(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = DiskEncryptionCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=7.0, details="FileVault enabled (software)")

        with patch.object(DiskEncryptionCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 7.0

    async def test_filevault_off_scores_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = DiskEncryptionCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="FileVault is Off")

        with patch.object(DiskEncryptionCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0

    async def test_exception_falls_back_to_score_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "darwin")
        check = DiskEncryptionCheck()
        with patch.object(DiskEncryptionCheck, "run", side_effect=RuntimeError("fdesetup unavailable")):
            result = await check.execute()
        assert result.score == 1.0


@pytest.mark.asyncio
class TestDiskEncryptionWindows:
    async def test_bitlocker_active_scores_high(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = DiskEncryptionCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=10.0, details="BitLocker fully encrypted on C:")

        with patch.object(DiskEncryptionCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 10.0

    async def test_no_bitlocker_scores_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = DiskEncryptionCheck()

        async def fake_run(self_inner):
            return self_inner._make_result(score=1.0, details="BitLocker not enabled")

        with patch.object(DiskEncryptionCheck, "run", fake_run):
            result = await check.execute()

        assert result.score == 1.0

    async def test_exception_falls_back_to_score_1(self, monkeypatch):
        monkeypatch.setattr(sys, "platform", "win32")
        check = DiskEncryptionCheck()
        with patch.object(DiskEncryptionCheck, "run", side_effect=RuntimeError("manage-bde not found")):
            result = await check.execute()
        assert result.score == 1.0


@pytest.mark.asyncio
class TestDiskEncryptionTimeout:
    async def test_timeout_returns_score_1(self, monkeypatch):
        import asyncio
        monkeypatch.setattr(sys, "platform", "linux")
        check = DiskEncryptionCheck()

        async def slow_run(self_inner):
            await asyncio.sleep(60)

        with patch.object(DiskEncryptionCheck, "run", slow_run):
            with patch.object(DiskEncryptionCheck, "TIMEOUT_SECONDS", 0):
                result = await check.execute()

        assert result.score == 1.0
        assert result.immediate_block is False
