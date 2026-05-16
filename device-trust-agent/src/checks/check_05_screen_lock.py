"""
MedTrustX Device Trust Agent — Check 05: Screen Lock & Authentication (weight: 10%).

Verifies that the device requires authentication after an idle period
that meets MedTrustX policy requirements, and that authentication
strength meets minimum standards.

Scoring:
  10 — lock ≤ 1 min, biometric + PIN, complex password policy
   8 — lock ≤ 5 min, PIN/password required
   5 — lock ≤ 15 min, simple PIN
   3 — lock > 15 min or password not required on wake
   1 — no screen lock set
"""

from __future__ import annotations

import asyncio
import os
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import structlog

from src.checks.base_check import BaseCheck
from src.models.check_result import CheckResult
from src.platform_detector import Platform

logger = structlog.get_logger(__name__)

# Lock timeout thresholds in seconds
LOCK_IMMEDIATE = 60       # ≤ 1 minute → score 10
LOCK_SHORT = 300          # ≤ 5 minutes → score 8
LOCK_MEDIUM = 900         # ≤ 15 minutes → score 5
# > 15 minutes → score 3
# not set → score 1

# Mobile timeout thresholds in seconds
MOBILE_LOCK_IMMEDIATE = 60   # ≤ 1 min
MOBILE_LOCK_SHORT = 120      # ≤ 2 min → score 8


class ScreenLockCheck(BaseCheck):
    """Check 05 — Screen Lock & Authentication.

    Verifies that the device is configured to lock after an appropriate
    idle timeout and requires strong authentication to unlock.
    """

    CHECK_ID = 5
    CHECK_NAME = "Screen Lock & Authentication"
    WEIGHT = 0.10
    TIMEOUT_SECONDS = 10

    def is_supported(self, platform: Platform) -> bool:
        return platform in (
            Platform.WINDOWS,
            Platform.MACOS,
            Platform.LINUX,
            Platform.IOS,
            Platform.ANDROID,
        )

    async def run(self) -> CheckResult:
        """Dispatch to platform-specific screen lock check."""
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
        return await asyncio.get_event_loop().run_in_executor(
            None, self._check_android
        )

    # ── Windows ────────────────────────────────────────────────────────────

    def _check_windows(self) -> CheckResult:
        """Check Windows screensaver timeout and password requirement."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # Read current user screensaver settings from registry
        timeout_seconds, is_secure = self._get_windows_screensaver_settings()
        details["screensaver_timeout_seconds"] = timeout_seconds
        details["screensaver_password_required"] = is_secure

        # Check Group Policy override
        gp_timeout, gp_secure = self._get_windows_gp_screen_settings()
        details["gp_timeout_seconds"] = gp_timeout
        details["gp_password_required"] = gp_secure

        # Use the most restrictive (lowest) timeout from user/GP settings
        effective_timeout = None
        if timeout_seconds is not None and gp_timeout is not None:
            effective_timeout = min(timeout_seconds, gp_timeout)
        elif timeout_seconds is not None:
            effective_timeout = timeout_seconds
        elif gp_timeout is not None:
            effective_timeout = gp_timeout

        effective_secure = is_secure or gp_secure
        details["effective_timeout_seconds"] = effective_timeout
        details["effective_password_required"] = effective_secure

        # Detect Windows Hello biometric
        hello_enabled = self._check_windows_hello()
        details["windows_hello_enabled"] = hello_enabled

        if effective_timeout is None:
            recommendations.append(
                "Screensaver/lock timeout not configured. "
                "Set: Computer Configuration → Windows Settings → Security Settings → "
                "Local Policies → Security Options → Interactive Logon"
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        if not effective_secure:
            recommendations.append(
                "Screensaver does not require password on resume. "
                "Enable: Control Panel → Power Options → Require password on wakeup"
            )
            return self._make_result(
                score=3.0,
                details=details,
                recommendations=recommendations,
            )

        score = self._score_timeout(effective_timeout, hello_enabled, recommendations)
        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations or ["Screen lock is properly configured."],
        )

    def _get_windows_screensaver_settings(self) -> Tuple[Optional[int], bool]:
        """Read screensaver timeout and password settings from HKCU registry."""
        timeout = None
        is_secure = False
        try:
            import winreg  # type: ignore[import]
            key = winreg.OpenKey(
                winreg.HKEY_CURRENT_USER,
                r"Control Panel\Desktop",
            )
            # ScreenSaveActive: "1" = enabled
            ss_active = winreg.QueryValueEx(key, "ScreenSaveActive")[0]
            if ss_active == "1":
                timeout_str = winreg.QueryValueEx(key, "ScreenSaveTimeOut")[0]
                timeout = int(timeout_str)
            # ScreenSaverIsSecure: "1" = password required
            try:
                secure = winreg.QueryValueEx(key, "ScreenSaverIsSecure")[0]
                is_secure = secure == "1"
            except FileNotFoundError:
                is_secure = False
            winreg.CloseKey(key)
        except Exception as exc:
            logger.warning("screensaver_registry_read_failed", error=str(exc))
        return timeout, is_secure

    def _get_windows_gp_screen_settings(self) -> Tuple[Optional[int], bool]:
        """Read Group Policy screen lock settings from HKLM registry."""
        timeout = None
        is_secure = False
        try:
            import winreg  # type: ignore[import]
            gp_path = (
                r"SOFTWARE\Policies\Microsoft\Windows\Control Panel\Desktop"
            )
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, gp_path)
            try:
                timeout_str = winreg.QueryValueEx(key, "ScreenSaveTimeOut")[0]
                timeout = int(timeout_str)
            except FileNotFoundError:
                pass
            try:
                secure = winreg.QueryValueEx(key, "ScreenSaverIsSecure")[0]
                is_secure = secure == "1"
            except FileNotFoundError:
                pass
            winreg.CloseKey(key)
        except Exception:
            pass
        return timeout, is_secure

    def _check_windows_hello(self) -> bool:
        """Detect if Windows Hello biometric authentication is enabled."""
        try:
            import winreg  # type: ignore[import]
            key = winreg.OpenKey(
                winreg.HKEY_LOCAL_MACHINE,
                r"SOFTWARE\Policies\Microsoft\PassportForWork",
            )
            enabled = winreg.QueryValueEx(key, "Enabled")[0]
            winreg.CloseKey(key)
            return bool(enabled)
        except Exception:
            # Check for biometric service
            try:
                result = subprocess.run(
                    ["sc", "query", "WbioSrvc"],
                    capture_output=True, text=True, timeout=5,
                )
                return "RUNNING" in result.stdout
            except Exception:
                return False

    # ── macOS ──────────────────────────────────────────────────────────────

    def _check_macos(self) -> CheckResult:
        """Check macOS screensaver password and idle timeout via defaults."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # Read screensaver settings
        ask_for_password = self._read_macos_default(
            "com.apple.screensaver", "askForPassword"
        )
        idle_time_str = self._read_macos_default(
            "com.apple.screensaver", "idleTime"
        )

        details["ask_for_password"] = ask_for_password
        details["idle_time_raw"] = idle_time_str

        password_required = str(ask_for_password).strip() == "1"
        details["password_required"] = password_required

        idle_time = None
        try:
            idle_time = int(str(idle_time_str).strip())
        except (ValueError, TypeError):
            idle_time = None
        details["idle_time_seconds"] = idle_time

        # Check Touch ID availability
        touch_id_enabled = self._check_macos_touch_id()
        details["touch_id_available"] = touch_id_enabled

        if idle_time is None or idle_time == 0:
            # idleTime = 0 means "Never" in macOS
            recommendations.append(
                "macOS screensaver is not configured to lock automatically. "
                "Set: System Settings → Lock Screen → Start Screen Saver after. "
                "Or: defaults write com.apple.screensaver idleTime 300"
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        if not password_required:
            recommendations.append(
                "macOS screensaver does not require password. "
                "Enable: System Settings → Lock Screen → Require password after screen saver begins. "
                "Or: defaults write com.apple.screensaver askForPassword 1"
            )
            return self._make_result(
                score=3.0,
                details=details,
                recommendations=recommendations,
            )

        score = self._score_timeout(idle_time, touch_id_enabled, recommendations)
        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations or ["Screen lock is properly configured."],
        )

    def _read_macos_default(self, domain: str, key: str) -> Optional[str]:
        """Read a macOS defaults value for a given domain and key."""
        try:
            result = subprocess.run(
                ["defaults", "read", domain, key],
                capture_output=True, text=True, timeout=5,
            )
            if result.returncode == 0:
                return result.stdout.strip()
        except Exception as exc:
            logger.warning("defaults_read_failed", domain=domain, key=key, error=str(exc))
        return None

    def _check_macos_touch_id(self) -> bool:
        """Detect if Touch ID is available and configured."""
        try:
            result = subprocess.run(
                ["bioutil", "-r"],
                capture_output=True, text=True, timeout=5,
            )
            return result.returncode == 0 and "true" in result.stdout.lower()
        except Exception:
            # Check for Biometric Kit framework presence
            return Path(
                "/System/Library/Frameworks/LocalAuthentication.framework"
            ).exists()

    # ── Linux ──────────────────────────────────────────────────────────────

    def _check_linux(self) -> CheckResult:
        """Check Linux screen lock timeout via GNOME and KDE settings."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # Try GNOME settings
        gnome_result = self._check_gnome_lock()
        details["gnome"] = gnome_result

        # Try KDE settings
        kde_result = self._check_kde_lock()
        details["kde"] = kde_result

        # Determine which desktop environment is active
        de = os.environ.get("XDG_CURRENT_DESKTOP", "").lower()
        details["desktop_environment"] = de

        # Use GNOME findings if available
        if gnome_result.get("lock_enabled") is not None:
            lock_enabled = gnome_result.get("lock_enabled", False)
            timeout_seconds = gnome_result.get("lock_delay_seconds")

            if not lock_enabled:
                recommendations.append(
                    "GNOME screen lock is disabled. Enable: "
                    "gsettings set org.gnome.desktop.screensaver lock-enabled true"
                )
                return self._make_result(
                    score=1.0,
                    details=details,
                    recommendations=recommendations,
                )

            if timeout_seconds is None:
                score = 5.0
                recommendations.append(
                    "GNOME screen lock delay is not configured. Set: "
                    "gsettings set org.gnome.desktop.screensaver lock-delay 300"
                )
            else:
                score = self._score_timeout(timeout_seconds, False, recommendations)
            return self._make_result(
                score=score,
                details=details,
                recommendations=recommendations or ["Screen lock is properly configured."],
            )

        # Use KDE findings if GNOME not found
        if kde_result.get("timeout_seconds") is not None:
            timeout_seconds = kde_result["timeout_seconds"]
            score = self._score_timeout(timeout_seconds, False, recommendations)
            return self._make_result(
                score=score,
                details=details,
                recommendations=recommendations or ["KDE screen lock is properly configured."],
            )

        # No desktop environment screen lock detected
        recommendations.append(
            "No screen lock configuration detected. "
            "For GNOME: gsettings set org.gnome.desktop.screensaver lock-enabled true. "
            "For KDE: kwriteconfig5 --file kscreenlockerrc --group Daemon --key Timeout 5"
        )
        return self._make_result(
            score=1.0,
            details=details,
            recommendations=recommendations,
        )

    def _check_gnome_lock(self) -> Dict[str, Any]:
        """Read GNOME screensaver lock settings via gsettings."""
        result: Dict[str, Any] = {}
        try:
            lock_enabled_result = subprocess.run(
                ["gsettings", "get", "org.gnome.desktop.screensaver", "lock-enabled"],
                capture_output=True, text=True, timeout=5,
            )
            if lock_enabled_result.returncode == 0:
                result["lock_enabled"] = lock_enabled_result.stdout.strip().lower() == "true"

            lock_delay_result = subprocess.run(
                ["gsettings", "get", "org.gnome.desktop.screensaver", "lock-delay"],
                capture_output=True, text=True, timeout=5,
            )
            if lock_delay_result.returncode == 0:
                delay_str = lock_delay_result.stdout.strip()
                # Can be "uint32 300" or just "300"
                import re
                match = re.search(r"\d+", delay_str)
                if match:
                    result["lock_delay_seconds"] = int(match.group())

            # Also get screensaver idle activation delay
            idle_result = subprocess.run(
                ["gsettings", "get", "org.gnome.desktop.session", "idle-delay"],
                capture_output=True, text=True, timeout=5,
            )
            if idle_result.returncode == 0:
                idle_str = idle_result.stdout.strip()
                match = re.search(r"\d+", idle_str)
                if match:
                    idle_delay = int(match.group())
                    lock_delay = result.get("lock_delay_seconds", 0)
                    result["total_lock_delay_seconds"] = idle_delay + lock_delay
        except FileNotFoundError:
            pass
        except Exception as exc:
            logger.warning("gsettings_read_failed", error=str(exc))
        return result

    def _check_kde_lock(self) -> Dict[str, Any]:
        """Read KDE screen locker settings."""
        result: Dict[str, Any] = {}
        try:
            timeout_result = subprocess.run(
                [
                    "kreadconfig5",
                    "--file", "kscreenlockerrc",
                    "--group", "Daemon",
                    "--key", "Timeout",
                ],
                capture_output=True, text=True, timeout=5,
            )
            if timeout_result.returncode == 0:
                timeout_str = timeout_result.stdout.strip()
                if timeout_str.isdigit():
                    # kscreenlocker stores timeout in minutes
                    result["timeout_seconds"] = int(timeout_str) * 60

            lock_result = subprocess.run(
                [
                    "kreadconfig5",
                    "--file", "kscreenlockerrc",
                    "--group", "Daemon",
                    "--key", "Autolock",
                ],
                capture_output=True, text=True, timeout=5,
            )
            if lock_result.returncode == 0:
                result["autolock_enabled"] = lock_result.stdout.strip().lower() == "true"
        except FileNotFoundError:
            pass
        except Exception as exc:
            logger.warning("kreadconfig5_failed", error=str(exc))
        return result

    # ── iOS ────────────────────────────────────────────────────────────────

    def _check_ios(self) -> CheckResult:
        """Check iOS auto-lock timeout and passcode complexity from MDM."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # MDM profile provides maxInactivity in seconds
        max_inactivity_str = os.environ.get("MEDTRUSTX_MAX_INACTIVITY", "")
        passcode_type = os.environ.get("MEDTRUSTX_PASSCODE_TYPE", "").lower()
        min_passcode_length = os.environ.get("MEDTRUSTX_MIN_PASSCODE_LENGTH", "")
        face_id_enabled = os.environ.get("MEDTRUSTX_FACE_ID_ENABLED", "").lower() == "true"

        details["max_inactivity_seconds_raw"] = max_inactivity_str
        details["passcode_type"] = passcode_type
        details["min_passcode_length"] = min_passcode_length
        details["face_id_enabled"] = face_id_enabled

        max_inactivity = None
        try:
            max_inactivity = int(max_inactivity_str)
            details["max_inactivity_seconds"] = max_inactivity
        except (ValueError, TypeError):
            pass

        if max_inactivity is None:
            recommendations.append(
                "iOS auto-lock timeout is not configured via MDM. "
                "Set maxInactivity ≤ 120 seconds in MDM profile."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        has_biometric = face_id_enabled
        # Assess passcode complexity
        strong_passcode = False
        min_len = 0
        try:
            min_len = int(min_passcode_length)
        except (ValueError, TypeError):
            pass
        if min_len >= 6:
            strong_passcode = True
        details["strong_passcode"] = strong_passcode

        if max_inactivity > 900:  # > 15 min
            recommendations.append(
                f"iOS auto-lock is set to {max_inactivity}s. "
                "Policy requires ≤ 120 seconds. Update MDM profile."
            )
            return self._make_result(score=3.0, details=details, recommendations=recommendations)

        score = self._score_mobile_timeout(max_inactivity, has_biometric, strong_passcode, recommendations)
        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations or ["iOS screen lock is properly configured."],
        )

    # ── Android ────────────────────────────────────────────────────────────

    def _check_android(self) -> CheckResult:
        """Check Android screen lock timeout and PIN/biometric requirements."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # DevicePolicyManager.getMaximumTimeToLock() in milliseconds
        max_time_to_lock_str = os.environ.get("MEDTRUSTX_MAX_TIME_TO_LOCK", "")
        lock_type = os.environ.get("MEDTRUSTX_LOCK_TYPE", "").lower()
        biometric_enabled = os.environ.get("MEDTRUSTX_BIOMETRIC_ENABLED", "").lower() == "true"

        details["max_time_to_lock_ms_raw"] = max_time_to_lock_str
        details["lock_type"] = lock_type
        details["biometric_enabled"] = biometric_enabled

        max_time_ms = None
        try:
            max_time_ms = int(max_time_to_lock_str)
            details["max_time_to_lock_ms"] = max_time_ms
            details["max_time_to_lock_seconds"] = max_time_ms // 1000
        except (ValueError, TypeError):
            pass

        if max_time_ms is None:
            recommendations.append(
                "Android screen lock timeout not configured via MDM. "
                "Set DevicePolicyManager.setMaximumTimeToLock ≤ 120000ms."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        max_time_seconds = max_time_ms // 1000
        has_lock = lock_type in ("pin", "password", "pattern", "biometric", "fingerprint")
        details["has_lock"] = has_lock

        if not has_lock:
            recommendations.append(
                "Android does not have a screen lock PIN/password set. "
                "Configure via Settings → Security → Screen Lock."
            )
            return self._make_result(score=1.0, details=details, recommendations=recommendations)

        strong_lock = lock_type in ("pin", "password") or biometric_enabled
        score = self._score_mobile_timeout(max_time_seconds, biometric_enabled, strong_lock, recommendations)
        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations or ["Android screen lock is properly configured."],
        )

    # ── Shared scoring helpers ─────────────────────────────────────────────

    def _score_timeout(
        self,
        timeout_seconds: int,
        has_biometric: bool,
        recommendations: List[str],
    ) -> float:
        """Score desktop screen lock based on timeout and biometric availability."""
        if timeout_seconds <= LOCK_IMMEDIATE:
            base_score = 10.0
        elif timeout_seconds <= LOCK_SHORT:
            base_score = 8.0
        elif timeout_seconds <= LOCK_MEDIUM:
            base_score = 5.0
        else:
            recommendations.append(
                f"Screen lock timeout is {timeout_seconds // 60} minutes. "
                "Policy requires ≤ 5 minutes. Reduce lock timeout."
            )
            base_score = 3.0
        if has_biometric and base_score >= 8.0:
            return 10.0
        return base_score

    def _score_mobile_timeout(
        self,
        timeout_seconds: int,
        has_biometric: bool,
        strong_lock: bool,
        recommendations: List[str],
    ) -> float:
        """Score mobile screen lock based on timeout and authentication strength."""
        if timeout_seconds <= MOBILE_LOCK_IMMEDIATE:
            base_score = 10.0 if (has_biometric and strong_lock) else 8.0
        elif timeout_seconds <= MOBILE_LOCK_SHORT:
            base_score = 8.0
        elif timeout_seconds <= 900:
            base_score = 5.0
            recommendations.append(
                f"Screen lock timeout is {timeout_seconds}s. "
                "Policy requires ≤ 120 seconds for mobile devices."
            )
        else:
            base_score = 3.0
            recommendations.append(
                f"Screen lock timeout is {timeout_seconds}s. "
                "Reduce to ≤ 120 seconds immediately."
            )
        return base_score
