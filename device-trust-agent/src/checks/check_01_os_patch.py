"""
MedTrustX Device Trust Agent — Check 01: OS Patch Level (weight: 15%).

Detects the current OS version and patch level, compares against known
minimum secure versions per platform, and scores based on currency of
patches and version support status.

Scoring:
  10 — fully patched, current version, < 7 days old
   8 — current version, patches 8–30 days old
   5 — one minor version behind, patches 31–60 days old
   3 — two versions behind OR patches > 60 days old
   1 — critically outdated (EOL OS or > 180 days unpatched)
"""

from __future__ import annotations

import asyncio
import os
import plistlib
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import structlog

from src.checks.base_check import BaseCheck
from src.models.check_result import CheckResult
from src.platform_detector import Platform

logger = structlog.get_logger(__name__)

# ── Minimum version requirements per platform ──────────────────────────────

# Windows: minimum build numbers for supported versions
# Windows 10 21H2 = 19044, Windows 11 21H2 = 22000
WINDOWS_MIN_BUILD = 19044
WINDOWS_WIN11_MIN_BUILD = 22000

# macOS: minimum version tuple (major, minor)
MACOS_MIN_VERSION = (13, 0)   # Ventura 13.0
MACOS_CURRENT_VERSION = (14, 0)  # Sonoma 14.0

# Linux: minimum kernel version tuple (major, minor)
LINUX_MIN_KERNEL = (5, 15)

# iOS: minimum version
IOS_MIN_VERSION = (17, 0)

# Android: minimum API level / version
ANDROID_MIN_VERSION = (12, 0)
ANDROID_MAX_PATCH_AGE_DAYS = 60


class OsPatchCheck(BaseCheck):
    """Check 01 — OS Patch Level.

    Evaluates whether the device's operating system is sufficiently
    current and patched to meet MedTrustX security requirements.
    """

    CHECK_ID = 1
    CHECK_NAME = "OS Patch Level"
    WEIGHT = 0.15
    TIMEOUT_SECONDS = 15

    def is_supported(self, platform: Platform) -> bool:
        return platform in (
            Platform.WINDOWS,
            Platform.MACOS,
            Platform.LINUX,
            Platform.IOS,
            Platform.ANDROID,
        )

    async def run(self) -> CheckResult:
        """Dispatch to platform-specific patch level check."""
        platform = self._platform_info.platform
        if platform == Platform.WINDOWS:
            return await asyncio.get_event_loop().run_in_executor(
                None, self._check_windows
            )
        if platform == Platform.MACOS:
            return await asyncio.get_event_loop().run_in_executor(
                None, self._check_macos
            )
        if platform == Platform.LINUX:
            return await asyncio.get_event_loop().run_in_executor(
                None, self._check_linux
            )
        if platform == Platform.IOS:
            return await asyncio.get_event_loop().run_in_executor(
                None, self._check_ios
            )
        # Android
        return await asyncio.get_event_loop().run_in_executor(
            None, self._check_android
        )

    # ── Windows ────────────────────────────────────────────────────────────

    def _check_windows(self) -> CheckResult:
        """Check Windows OS version and patch currency via registry and WMI."""
        import winreg  # type: ignore[import]

        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        try:
            # Read version info from registry
            key = winreg.OpenKey(
                winreg.HKEY_LOCAL_MACHINE,
                r"SOFTWARE\Microsoft\Windows NT\CurrentVersion",
            )
            current_build = int(winreg.QueryValueEx(key, "CurrentBuild")[0])
            display_version = winreg.QueryValueEx(key, "DisplayVersion")[0]
            ubr = int(winreg.QueryValueEx(key, "UBR")[0])
            winreg.CloseKey(key)

            details["current_build"] = current_build
            details["display_version"] = display_version
            details["ubr"] = ubr
            details["full_build"] = f"{current_build}.{ubr}"

        except Exception as exc:
            return self._make_result(
                score=1.0,
                details={"error": f"Registry read failed: {exc}"},
                recommendations=["Unable to read Windows version from registry. "
                                  "Ensure agent has SYSTEM-level registry access."],
            )

        # Determine if Windows 10 or 11
        is_win11 = current_build >= WINDOWS_WIN11_MIN_BUILD
        is_win10_supported = current_build >= WINDOWS_MIN_BUILD
        details["is_windows_11"] = is_win11
        details["is_win10_21h2_or_later"] = is_win10_supported

        if not is_win10_supported:
            recommendations.append(
                f"Windows build {current_build} is below the minimum required build "
                f"{WINDOWS_MIN_BUILD} (Windows 10 21H2). Upgrade immediately."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        # Query last Windows Update install date via COM
        last_patch_date, patch_age_days = self._get_windows_last_patch_date()
        details["last_patch_date"] = last_patch_date.isoformat() if last_patch_date else None
        details["patch_age_days"] = patch_age_days

        if patch_age_days is None:
            recommendations.append(
                "Unable to determine last Windows Update date. "
                "Verify Windows Update service is running."
            )
            score = 3.0
        elif patch_age_days > 180:
            recommendations.append(
                f"Windows patches are {patch_age_days} days old. "
                "This device has not been patched for over 6 months. Update immediately."
            )
            score = 1.0
        elif patch_age_days > 60:
            recommendations.append(
                f"Windows patches are {patch_age_days} days old. "
                "Enable automatic Windows Updates to stay current."
            )
            score = 3.0
        elif patch_age_days > 30:
            recommendations.append(
                f"Windows patches are {patch_age_days} days old. "
                "Check for available updates and apply them."
            )
            score = 5.0
        elif patch_age_days > 7:
            score = 8.0
        else:
            score = 10.0

        if not recommendations:
            recommendations.append(
                "Windows OS is fully patched and up to date. No action required."
            )

        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations,
        )

    def _get_windows_last_patch_date(self) -> Tuple[Optional[datetime], Optional[int]]:
        """Query Windows Update history via COM to find last successful install date."""
        try:
            import win32com.client  # type: ignore[import]
            session = win32com.client.Dispatch("Microsoft.Update.Session")
            searcher = session.CreateUpdateSearcher()
            history_count = searcher.GetTotalHistoryCount()
            if history_count == 0:
                return None, None
            # Get last 20 updates to find most recent successful install
            history = searcher.QueryHistory(0, min(history_count, 20))
            for i in range(history.Count):
                entry = history.Item(i)
                # ResultCode 2 = Succeeded
                if entry.ResultCode == 2:
                    install_date = entry.Date
                    # COM date is timezone-naive; treat as UTC
                    if hasattr(install_date, "replace"):
                        install_date = install_date.replace(tzinfo=timezone.utc)
                    now = datetime.now(timezone.utc)
                    age_days = (now - install_date).days
                    return install_date, age_days
        except Exception as exc:
            logger.warning("windows_update_history_query_failed", error=str(exc))
        # Fallback: read from registry CBS log timestamps
        try:
            import winreg  # type: ignore[import]
            key = winreg.OpenKey(
                winreg.HKEY_LOCAL_MACHINE,
                r"SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update\Results\Install",
            )
            last_success_time = winreg.QueryValueEx(key, "LastSuccessTime")[0]
            winreg.CloseKey(key)
            install_date = datetime.fromisoformat(last_success_time).replace(tzinfo=timezone.utc)
            age_days = (datetime.now(timezone.utc) - install_date).days
            return install_date, age_days
        except Exception:
            pass
        return None, None

    # ── macOS ──────────────────────────────────────────────────────────────

    def _check_macos(self) -> CheckResult:
        """Check macOS version and update currency."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # Get current macOS version
        try:
            result = subprocess.run(
                ["sw_vers", "-productVersion"],
                capture_output=True, text=True, timeout=5,
            )
            version_str = result.stdout.strip()
            parts = version_str.split(".")
            major = int(parts[0]) if parts else 0
            minor = int(parts[1]) if len(parts) > 1 else 0
            details["macos_version"] = version_str
            details["major"] = major
            details["minor"] = minor
        except Exception as exc:
            return self._make_result(
                score=1.0,
                details={"error": f"sw_vers failed: {exc}"},
                recommendations=["Unable to determine macOS version."],
            )

        current_version = (major, minor)
        details["meets_minimum"] = current_version >= MACOS_MIN_VERSION
        details["is_current"] = current_version >= MACOS_CURRENT_VERSION

        if current_version < MACOS_MIN_VERSION:
            recommendations.append(
                f"macOS {version_str} is below minimum required version "
                f"{MACOS_MIN_VERSION[0]}.{MACOS_MIN_VERSION[1]} (Ventura). "
                "Upgrade to macOS Ventura or Sonoma immediately."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        # Check pending software updates
        pending_updates = self._get_macos_pending_updates()
        details["pending_updates"] = pending_updates

        # Parse last update date from InstallHistory.plist
        last_patch_date, patch_age_days = self._get_macos_last_update_date()
        details["last_update_date"] = last_patch_date.isoformat() if last_patch_date else None
        details["patch_age_days"] = patch_age_days

        if patch_age_days is None:
            score = 5.0
            recommendations.append(
                "Unable to determine macOS last update date. "
                "Run 'softwareupdate -l' to check for available updates."
            )
        elif patch_age_days > 180:
            score = 1.0
            recommendations.append(
                f"macOS last updated {patch_age_days} days ago. "
                "Update immediately: System Settings → General → Software Update."
            )
        elif patch_age_days > 60:
            score = 3.0
            recommendations.append(
                f"macOS patches are {patch_age_days} days old. "
                "Run: sudo softwareupdate -ia"
            )
        elif patch_age_days > 30:
            score = 5.0 if current_version < MACOS_CURRENT_VERSION else 5.0
            recommendations.append(
                f"macOS patches are {patch_age_days} days old. "
                "Check System Settings → General → Software Update."
            )
        elif patch_age_days > 7:
            score = 8.0
        else:
            score = 10.0

        # Downgrade score if one version behind
        if current_version[0] == MACOS_MIN_VERSION[0] and current_version < MACOS_CURRENT_VERSION:
            score = min(score, 8.0)
            recommendations.append(
                f"Running macOS {version_str}. Consider upgrading to macOS Sonoma 14."
            )

        if not recommendations:
            recommendations.append("macOS is fully patched and current. No action required.")

        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations,
        )

    def _get_macos_pending_updates(self) -> List[str]:
        """Return list of pending software update names."""
        try:
            result = subprocess.run(
                ["softwareupdate", "--list"],
                capture_output=True, text=True, timeout=30,
            )
            updates = []
            for line in result.stdout.splitlines():
                line = line.strip()
                if line.startswith("*") or line.startswith("-"):
                    updates.append(line.lstrip("*- ").strip())
            return updates
        except Exception as exc:
            logger.warning("macos_pending_updates_failed", error=str(exc))
            return []

    def _get_macos_last_update_date(self) -> Tuple[Optional[datetime], Optional[int]]:
        """Parse last system update date from InstallHistory.plist."""
        plist_path = Path(
            "/Library/Receipts/InstallHistory.plist"
        )
        if not plist_path.exists():
            return None, None
        try:
            with open(plist_path, "rb") as f:
                history = plistlib.load(f)
            # History is a list of dicts with 'date' keys, newest last
            os_updates = [
                entry for entry in history
                if "macOS" in entry.get("displayName", "")
                or "OS X" in entry.get("displayName", "")
                or "Security Update" in entry.get("displayName", "")
            ]
            if not os_updates:
                os_updates = history
            if os_updates:
                last_entry = os_updates[-1]
                last_date = last_entry.get("date")
                if isinstance(last_date, datetime):
                    if last_date.tzinfo is None:
                        last_date = last_date.replace(tzinfo=timezone.utc)
                    age_days = (datetime.now(timezone.utc) - last_date).days
                    return last_date, age_days
        except Exception as exc:
            logger.warning("macos_install_history_parse_failed", error=str(exc))
        return None, None

    # ── Linux ──────────────────────────────────────────────────────────────

    def _check_linux(self) -> CheckResult:
        """Check Linux kernel version and package manager update currency."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # Get kernel version
        try:
            result = subprocess.run(
                ["uname", "-r"],
                capture_output=True, text=True, timeout=5,
            )
            kernel_str = result.stdout.strip()
            details["kernel_version"] = kernel_str

            # Parse major.minor from kernel version string
            match = re.match(r"(\d+)\.(\d+)", kernel_str)
            if match:
                k_major = int(match.group(1))
                k_minor = int(match.group(2))
                details["kernel_major"] = k_major
                details["kernel_minor"] = k_minor
                meets_kernel = (k_major, k_minor) >= LINUX_MIN_KERNEL
            else:
                meets_kernel = False
            details["meets_minimum_kernel"] = meets_kernel
        except Exception as exc:
            return self._make_result(
                score=1.0,
                details={"error": f"uname failed: {exc}"},
                recommendations=["Unable to determine Linux kernel version."],
            )

        if not meets_kernel:
            recommendations.append(
                f"Linux kernel {kernel_str} is below minimum required "
                f"{LINUX_MIN_KERNEL[0]}.{LINUX_MIN_KERNEL[1]} (LTS). "
                "Upgrade the kernel immediately."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        # Check package manager last update date
        last_update_date, update_age_days = self._get_linux_last_update_date()
        details["last_update_date"] = last_update_date.isoformat() if last_update_date else None
        details["update_age_days"] = update_age_days

        if update_age_days is None:
            score = 5.0
            recommendations.append(
                "Unable to determine last package update date. "
                "Run: sudo apt-get update && sudo apt-get upgrade -y"
            )
        elif update_age_days > 180:
            score = 1.0
            recommendations.append(
                f"System packages last updated {update_age_days} days ago. "
                "Update immediately: sudo apt-get update && sudo apt-get upgrade -y"
            )
        elif update_age_days > 60:
            score = 3.0
            recommendations.append(
                f"System packages are {update_age_days} days old. "
                "Update: sudo apt-get update && sudo apt-get upgrade -y"
            )
        elif update_age_days > 14:
            score = 5.0
            recommendations.append(
                f"System packages are {update_age_days} days old (threshold: 14 days). "
                "Consider running: sudo apt-get update && sudo apt-get upgrade -y"
            )
        elif update_age_days > 7:
            score = 8.0
        else:
            score = 10.0

        if not recommendations:
            recommendations.append(
                "Linux kernel and packages are current. No action required."
            )

        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations,
        )

    def _get_linux_last_update_date(self) -> Tuple[Optional[datetime], Optional[int]]:
        """Determine last package manager update date from cache timestamps."""
        # Debian/Ubuntu: check apt lists directory modification time
        apt_lists = Path("/var/lib/apt/lists")
        if apt_lists.exists():
            try:
                # Find the most recently modified file in apt lists
                most_recent = max(
                    (f.stat().st_mtime for f in apt_lists.iterdir() if f.is_file()),
                    default=None,
                )
                if most_recent:
                    last_date = datetime.fromtimestamp(most_recent, tz=timezone.utc)
                    age_days = (datetime.now(timezone.utc) - last_date).days
                    return last_date, age_days
            except Exception as exc:
                logger.warning("apt_lists_stat_failed", error=str(exc))

        # RHEL/CentOS/Fedora: check yum cache
        yum_cache = Path("/var/cache/yum")
        if yum_cache.exists():
            try:
                most_recent = max(
                    (f.stat().st_mtime for f in yum_cache.rglob("*") if f.is_file()),
                    default=None,
                )
                if most_recent:
                    last_date = datetime.fromtimestamp(most_recent, tz=timezone.utc)
                    age_days = (datetime.now(timezone.utc) - last_date).days
                    return last_date, age_days
            except Exception as exc:
                logger.warning("yum_cache_stat_failed", error=str(exc))

        # DNF history
        dnf_history = Path("/var/cache/dnf")
        if dnf_history.exists():
            try:
                result = subprocess.run(
                    ["dnf", "history", "list", "--last=1"],
                    capture_output=True, text=True, timeout=10,
                )
                for line in result.stdout.splitlines():
                    match = re.search(r"(\d{4}-\d{2}-\d{2})", line)
                    if match:
                        last_date = datetime.strptime(
                            match.group(1), "%Y-%m-%d"
                        ).replace(tzinfo=timezone.utc)
                        age_days = (datetime.now(timezone.utc) - last_date).days
                        return last_date, age_days
            except Exception as exc:
                logger.warning("dnf_history_failed", error=str(exc))

        # Fallback: dpkg log
        dpkg_log = Path("/var/log/dpkg.log")
        if dpkg_log.exists():
            try:
                result = subprocess.run(
                    ["tail", "-20", str(dpkg_log)],
                    capture_output=True, text=True, timeout=5,
                )
                for line in reversed(result.stdout.splitlines()):
                    match = re.match(r"(\d{4}-\d{2}-\d{2})", line)
                    if match:
                        last_date = datetime.strptime(
                            match.group(1), "%Y-%m-%d"
                        ).replace(tzinfo=timezone.utc)
                        age_days = (datetime.now(timezone.utc) - last_date).days
                        return last_date, age_days
            except Exception as exc:
                logger.warning("dpkg_log_parse_failed", error=str(exc))

        return None, None

    # ── iOS ────────────────────────────────────────────────────────────────

    def _check_ios(self) -> CheckResult:
        """Check iOS version against minimum required version."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        os_version_str = os.environ.get("MEDTRUSTX_OS_VERSION", "")
        details["ios_version"] = os_version_str

        if not os_version_str:
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=["iOS version not available. Ensure MDM agent is enrolled."],
            )

        try:
            parts = os_version_str.split(".")
            major = int(parts[0])
            minor = int(parts[1]) if len(parts) > 1 else 0
            current = (major, minor)
            details["major"] = major
            details["minor"] = minor
            details["meets_minimum"] = current >= IOS_MIN_VERSION
        except (ValueError, IndexError) as exc:
            return self._make_result(
                score=1.0,
                details={**details, "parse_error": str(exc)},
                recommendations=["iOS version string could not be parsed."],
            )

        if current < IOS_MIN_VERSION:
            recommendations.append(
                f"iOS {os_version_str} is below minimum required version "
                f"{IOS_MIN_VERSION[0]}.{IOS_MIN_VERSION[1]}. "
                "Update via Settings → General → Software Update."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        # For iOS, patch age comes from security patch date in MDM profile
        patch_age_str = os.environ.get("MEDTRUSTX_PATCH_AGE_DAYS", "")
        patch_age_days = int(patch_age_str) if patch_age_str.isdigit() else None
        details["patch_age_days"] = patch_age_days

        score = self._score_from_patch_age(patch_age_days, recommendations)
        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations or ["iOS is current and patched."],
        )

    # ── Android ────────────────────────────────────────────────────────────

    def _check_android(self) -> CheckResult:
        """Check Android version and security patch level."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        os_version_str = os.environ.get("MEDTRUSTX_OS_VERSION", "")
        details["android_version"] = os_version_str

        if not os_version_str:
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=["Android version not available. Ensure MDM agent is enrolled."],
            )

        try:
            parts = os_version_str.split(".")
            major = int(parts[0])
            minor = int(parts[1]) if len(parts) > 1 else 0
            current = (major, minor)
            details["meets_minimum"] = current >= ANDROID_MIN_VERSION
        except (ValueError, IndexError) as exc:
            return self._make_result(
                score=1.0,
                details={**details, "parse_error": str(exc)},
                recommendations=["Android version string could not be parsed."],
            )

        if current < ANDROID_MIN_VERSION:
            recommendations.append(
                f"Android {os_version_str} is below minimum required version "
                f"Android {ANDROID_MIN_VERSION[0]}. "
                "Update via Settings → System → System Update."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        # Android security patch date from MDM
        security_patch_date_str = os.environ.get("MEDTRUSTX_SECURITY_PATCH_DATE", "")
        details["security_patch_date"] = security_patch_date_str

        if security_patch_date_str:
            try:
                patch_date = datetime.strptime(security_patch_date_str, "%Y-%m-%d").replace(
                    tzinfo=timezone.utc
                )
                patch_age_days = (datetime.now(timezone.utc) - patch_date).days
                details["patch_age_days"] = patch_age_days
                score = self._score_from_patch_age(patch_age_days, recommendations)
            except ValueError:
                score = 5.0
                recommendations.append("Security patch date format invalid.")
        else:
            score = 5.0
            recommendations.append(
                "Android security patch date not available. "
                "Ensure MDM policy enforces patch compliance reporting."
            )

        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations or ["Android OS is current and patched."],
        )

    # ── Shared scoring helper ──────────────────────────────────────────────

    def _score_from_patch_age(
        self, patch_age_days: Optional[int], recommendations: List[str]
    ) -> float:
        """Map patch age in days to a score and populate recommendations."""
        if patch_age_days is None:
            recommendations.append(
                "Patch age could not be determined. Enable MDM patch reporting."
            )
            return 5.0
        if patch_age_days > 180:
            recommendations.append(
                f"Security patches are {patch_age_days} days old. Update immediately."
            )
            return 1.0
        if patch_age_days > 60:
            recommendations.append(
                f"Security patches are {patch_age_days} days old. "
                "Apply updates as soon as possible."
            )
            return 3.0
        if patch_age_days > 30:
            recommendations.append(
                f"Security patches are {patch_age_days} days old. "
                "Schedule an update within the next 7 days."
            )
            return 5.0
        if patch_age_days > 7:
            return 8.0
        return 10.0
