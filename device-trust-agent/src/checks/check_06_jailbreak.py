"""
MedTrustX Device Trust Agent — Check 06: Jailbreak / Root Detection (weight: 12%).

CRITICAL CHECK — score of 1 triggers an IMMEDIATE BLOCK regardless of all
other check scores. Detects device tampering, privilege escalation, and
integrity violations across all platforms.

Scoring:
  10 — no tampering detected, all integrity checks pass
   5 — minor anomaly (non-standard binary, unsigned module)
   1 — jailbroken/rooted confirmed OR Secure Boot disabled
       OR SIP disabled → IMMEDIATE BLOCK
"""

from __future__ import annotations

import asyncio
import os
import platform
import re
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import structlog

from src.checks.base_check import BaseCheck
from src.models.check_result import CheckResult
from src.platform_detector import Platform

logger = structlog.get_logger(__name__)

# iOS jailbreak artifact paths
IOS_JAILBREAK_PATHS = [
    "/Applications/Cydia.app",
    "/Applications/Sileo.app",
    "/Applications/Zebra.app",
    "/Applications/Installer.app",
    "/usr/sbin/sshd",
    "/usr/bin/sshd",
    "/usr/libexec/ssh-keysign",
    "/etc/apt",
    "/etc/apt/sources.list.d",
    "/bin/bash",
    "/usr/bin/bash",
    "/var/cache/apt",
    "/var/lib/dpkg",
    "/usr/lib/apt",
    "/Library/MobileSubstrate/MobileSubstrate.dylib",
    "/var/checkra1n.dmg",
    "/private/var/jb",
    "/private/preboot/jb",
]

# Android root artifact paths
ANDROID_ROOT_PATHS = [
    "/system/bin/su",
    "/system/xbin/su",
    "/sbin/su",
    "/su/bin/su",
    "/data/local/su",
    "/data/local/bin/su",
    "/data/local/xbin/su",
    "/system/app/SuperSU",
    "/system/app/SuperSU.apk",
    "/system/app/Superuser.apk",
    "/data/adb/magisk",
    "/sbin/.magisk",
    "/data/adb/ksu",
    "/system/xbin/busybox",
]


class JailbreakCheck(BaseCheck):
    """Check 06 — Jailbreak / Root Detection.

    CRITICAL: A score of 1 on this check causes an immediate block of
    the device regardless of all other check scores.
    """

    CHECK_ID = 6
    CHECK_NAME = "Jailbreak / Root Detection"
    WEIGHT = 0.12
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
        """Dispatch to platform-specific integrity check."""
        plat = self._platform_info.platform
        if plat == Platform.WINDOWS:
            return await asyncio.get_event_loop().run_in_executor(
                None, self._check_windows
            )
        if plat == Platform.MACOS:
            return await asyncio.get_event_loop().run_in_executor(
                None, self._check_macos
            )
        if plat == Platform.LINUX:
            return await asyncio.get_event_loop().run_in_executor(
                None, self._check_linux
            )
        if plat == Platform.IOS:
            return await asyncio.get_event_loop().run_in_executor(
                None, self._check_ios
            )
        return await asyncio.get_event_loop().run_in_executor(
            None, self._check_android
        )

    # ── Windows ────────────────────────────────────────────────────────────

    def _check_windows(self) -> CheckResult:
        """Check Secure Boot, test-signing mode, driver integrity, and HVCI."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []
        anomalies: List[str] = []

        # Check Secure Boot via PowerShell Confirm-SecureBootUEFI
        secure_boot = self._check_windows_secure_boot()
        details["secure_boot_enabled"] = secure_boot
        if not secure_boot:
            anomalies.append("Secure Boot is disabled")
            recommendations.append(
                "Secure Boot is disabled. Enable in UEFI/BIOS settings. "
                "This prevents unauthorized boot loaders and OS modifications."
            )

        # Check test-signing and integrity checks via bcdedit
        bcdedit_flags = self._check_windows_bcdedit()
        details["bcdedit"] = bcdedit_flags
        if bcdedit_flags.get("testsigning"):
            anomalies.append("Test-signing mode enabled")
            recommendations.append(
                "Windows test-signing mode is enabled (bcdedit /set testsigning off). "
                "This allows unsigned drivers and indicates potential tampering."
            )
        if bcdedit_flags.get("nointegritychecks"):
            anomalies.append("Integrity checks disabled")
            recommendations.append(
                "Windows integrity checks are disabled. "
                "Re-enable: bcdedit /deletevalue nointegritychecks"
            )

        # Check HVCI (Hypervisor-Protected Code Integrity)
        hvci_enabled = self._check_windows_hvci()
        details["hvci_enabled"] = hvci_enabled
        if not hvci_enabled:
            anomalies.append("HVCI not enabled")
            recommendations.append(
                "Hypervisor-Protected Code Integrity (HVCI) is not enabled. "
                "Enable in Windows Security → Device Security → Core Isolation."
            )

        # Check for unsigned loaded drivers
        unsigned_drivers = self._check_unsigned_drivers()
        details["unsigned_driver_count"] = len(unsigned_drivers)
        details["unsigned_drivers"] = unsigned_drivers[:10]  # cap list length
        if unsigned_drivers:
            anomalies.append(f"{len(unsigned_drivers)} unsigned driver(s) loaded")
            recommendations.append(
                f"Unsigned drivers detected: {', '.join(unsigned_drivers[:3])}. "
                "Review and remove unauthorized drivers."
            )

        # Determine score
        if not secure_boot or bcdedit_flags.get("testsigning") or bcdedit_flags.get("nointegritychecks"):
            details["anomalies"] = anomalies
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
                immediate_block=True,
            )

        if anomalies:
            details["anomalies"] = anomalies
            return self._make_result(
                score=5.0,
                details=details,
                recommendations=recommendations,
            )

        return self._make_result(
            score=10.0,
            details={**details, "anomalies": []},
            recommendations=["All Windows integrity checks passed."],
        )

    def _check_windows_secure_boot(self) -> bool:
        """Check if Secure Boot is enabled via PowerShell."""
        try:
            result = subprocess.run(
                [
                    "powershell", "-NoProfile", "-NonInteractive", "-Command",
                    "try { Confirm-SecureBootUEFI } catch { $false }",
                ],
                capture_output=True, text=True, timeout=10,
            )
            output = result.stdout.strip().lower()
            return output == "true"
        except Exception as exc:
            logger.warning("secure_boot_check_failed", error=str(exc))
            # Try registry fallback
            try:
                import winreg  # type: ignore[import]
                key = winreg.OpenKey(
                    winreg.HKEY_LOCAL_MACHINE,
                    r"SYSTEM\CurrentControlSet\Control\SecureBoot\State",
                )
                uefi_state = winreg.QueryValueEx(key, "UEFISecureBootEnabled")[0]
                winreg.CloseKey(key)
                return bool(uefi_state)
            except Exception:
                return False

    def _check_windows_bcdedit(self) -> Dict[str, bool]:
        """Parse bcdedit /enum output for dangerous boot flags."""
        flags: Dict[str, bool] = {
            "testsigning": False,
            "nointegritychecks": False,
            "debug": False,
            "bootdebug": False,
        }
        try:
            result = subprocess.run(
                ["bcdedit", "/enum"],
                capture_output=True, text=True, timeout=10,
            )
            output = result.stdout.lower()
            flags["testsigning"] = "testsigning" in output and "yes" in output
            flags["nointegritychecks"] = "nointegritychecks" in output and "yes" in output
            flags["debug"] = bool(re.search(r"debugtype\s+local", output))
            flags["bootdebug"] = "bootdebug" in output and "yes" in output
        except Exception as exc:
            logger.warning("bcdedit_failed", error=str(exc))
        return flags

    def _check_windows_hvci(self) -> bool:
        """Check Hypervisor-Protected Code Integrity status via registry."""
        try:
            import winreg  # type: ignore[import]
            key = winreg.OpenKey(
                winreg.HKEY_LOCAL_MACHINE,
                r"SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity",
            )
            enabled = winreg.QueryValueEx(key, "Enabled")[0]
            winreg.CloseKey(key)
            return bool(enabled)
        except Exception:
            # Try alternate registry path
            try:
                import winreg  # type: ignore[import]
                key = winreg.OpenKey(
                    winreg.HKEY_LOCAL_MACHINE,
                    r"SYSTEM\CurrentControlSet\Control\CI\Config",
                )
                hvci = winreg.QueryValueEx(key, "HVCIPolicy")[0]
                winreg.CloseKey(key)
                return hvci in (1, 2)
            except Exception:
                return False

    def _check_unsigned_drivers(self) -> List[str]:
        """Return list of loaded unsigned driver names via PowerShell."""
        try:
            result = subprocess.run(
                [
                    "powershell", "-NoProfile", "-NonInteractive", "-Command",
                    "Get-WindowsDriver -Online | "
                    "Where-Object { $_.IsSigned -eq $false } | "
                    "Select-Object -ExpandProperty OriginalFileName",
                ],
                capture_output=True, text=True, timeout=15,
            )
            drivers = [
                line.strip()
                for line in result.stdout.splitlines()
                if line.strip() and line.strip() != "OriginalFileName"
            ]
            return drivers
        except Exception as exc:
            logger.warning("unsigned_driver_check_failed", error=str(exc))
            return []

    # ── macOS ──────────────────────────────────────────────────────────────

    def _check_macos(self) -> CheckResult:
        """Check SIP status, Gatekeeper, and boot-args integrity on macOS."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []
        anomalies: List[str] = []

        # Check SIP (System Integrity Protection)
        sip_enabled, sip_output = self._check_macos_sip()
        details["sip_enabled"] = sip_enabled
        details["sip_status_output"] = sip_output
        if not sip_enabled:
            anomalies.append("SIP disabled")
            recommendations.append(
                "System Integrity Protection (SIP) is DISABLED. "
                "This is a critical security violation. "
                "Re-enable by booting to Recovery Mode and running: csrutil enable"
            )

        # Check Gatekeeper
        gatekeeper_enabled = self._check_macos_gatekeeper()
        details["gatekeeper_enabled"] = gatekeeper_enabled
        if not gatekeeper_enabled:
            anomalies.append("Gatekeeper disabled")
            recommendations.append(
                "Gatekeeper is disabled. Re-enable: sudo spctl --master-enable"
            )

        # Check boot-args for dangerous flags
        boot_args_clean, boot_args_value = self._check_macos_boot_args()
        details["boot_args"] = boot_args_value
        details["boot_args_clean"] = boot_args_clean
        if not boot_args_clean:
            anomalies.append(f"Dangerous boot-args detected: {boot_args_value}")
            recommendations.append(
                f"Dangerous boot arguments detected: '{boot_args_value}'. "
                "Clear boot-args: sudo nvram -d boot-args"
            )

        # SIP disabled is an immediate block
        if not sip_enabled:
            details["anomalies"] = anomalies
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
                immediate_block=True,
            )

        if anomalies:
            details["anomalies"] = anomalies
            return self._make_result(
                score=5.0,
                details=details,
                recommendations=recommendations,
            )

        return self._make_result(
            score=10.0,
            details={**details, "anomalies": []},
            recommendations=["All macOS integrity checks passed. SIP and Gatekeeper are enabled."],
        )

    def _check_macos_sip(self) -> Tuple[bool, str]:
        """Run csrutil status and parse output."""
        try:
            result = subprocess.run(
                ["csrutil", "status"],
                capture_output=True, text=True, timeout=5,
            )
            output = result.stdout.strip()
            enabled = "enabled" in output.lower() and "disabled" not in output.lower()
            return enabled, output
        except Exception as exc:
            logger.warning("csrutil_failed", error=str(exc))
            return False, f"error: {exc}"

    def _check_macos_gatekeeper(self) -> bool:
        """Check Gatekeeper status via spctl."""
        try:
            result = subprocess.run(
                ["spctl", "--status"],
                capture_output=True, text=True, timeout=5,
            )
            return "assessments enabled" in result.stdout.lower()
        except Exception as exc:
            logger.warning("spctl_failed", error=str(exc))
            return False

    def _check_macos_boot_args(self) -> Tuple[bool, str]:
        """Check nvram boot-args for dangerous flags."""
        dangerous_flags = [
            "-no_compat_check", "rootless=0", "kext-dev-mode=1",
            "amfi_get_out_of_my_way=1", "cs_enforcement_disable=1",
        ]
        try:
            result = subprocess.run(
                ["nvram", "boot-args"],
                capture_output=True, text=True, timeout=5,
            )
            if result.returncode != 0:
                return True, ""  # No boot-args set = clean
            boot_args = result.stdout.strip()
            for flag in dangerous_flags:
                if flag in boot_args:
                    return False, boot_args
            return True, boot_args
        except Exception as exc:
            logger.warning("nvram_boot_args_failed", error=str(exc))
            return True, ""

    # ── Linux ──────────────────────────────────────────────────────────────

    def _check_linux(self) -> CheckResult:
        """Check Linux for root UID, kernel taint, module sig enforcement."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []
        anomalies: List[str] = []

        # Check if agent is running as root (UID 0)
        current_uid = os.getuid()
        details["agent_uid"] = current_uid
        running_as_root = current_uid == 0
        details["running_as_root"] = running_as_root
        if running_as_root:
            anomalies.append("Agent running as root (UID=0)")
            recommendations.append(
                "The device trust agent is running as root. "
                "This is a security concern — run the agent as a dedicated low-privilege user."
            )

        # Check kernel taint flags
        tainted, taint_value = self._check_kernel_taint()
        details["kernel_tainted"] = tainted
        details["kernel_taint_value"] = taint_value
        if tainted:
            anomalies.append(f"Kernel is tainted (flags: {taint_value})")
            recommendations.append(
                f"Linux kernel is tainted (taint flags: {taint_value}). "
                "Tainted kernels indicate unofficial modules or modifications. "
                "Review loaded modules: lsmod"
            )

        # Check kernel module signature enforcement
        sig_enforce = self._check_module_sig_enforce()
        details["module_sig_enforce"] = sig_enforce
        if not sig_enforce:
            anomalies.append("Kernel module signature enforcement disabled")
            recommendations.append(
                "Kernel module signature enforcement is not enabled. "
                "Enable by adding 'module.sig_enforce=1' to kernel boot parameters."
            )

        # Check for unauthorized setuid binaries outside of standard paths
        suspicious_setuid = self._check_suspicious_setuid()
        details["suspicious_setuid_count"] = len(suspicious_setuid)
        details["suspicious_setuid_samples"] = suspicious_setuid[:5]
        if suspicious_setuid:
            anomalies.append(f"{len(suspicious_setuid)} suspicious setuid binary/ies")
            recommendations.append(
                f"Suspicious setuid binaries found: {', '.join(suspicious_setuid[:3])}. "
                "Review and remove unauthorized setuid binaries."
            )

        # Kernel taint is a critical integrity violation
        if tainted:
            details["anomalies"] = anomalies
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
                immediate_block=True,
            )

        if anomalies:
            score = 5.0 if len(anomalies) <= 2 else 1.0
            details["anomalies"] = anomalies
            return self._make_result(
                score=score,
                details=details,
                recommendations=recommendations,
                immediate_block=(score == 1.0),
            )

        return self._make_result(
            score=10.0,
            details={**details, "anomalies": []},
            recommendations=["All Linux integrity checks passed."],
        )

    def _check_kernel_taint(self) -> Tuple[bool, int]:
        """Read /proc/sys/kernel/tainted and return (is_tainted, value)."""
        try:
            taint_path = Path("/proc/sys/kernel/tainted")
            value = int(taint_path.read_text().strip())
            return value != 0, value
        except Exception as exc:
            logger.warning("kernel_taint_read_failed", error=str(exc))
            return False, 0

    def _check_module_sig_enforce(self) -> bool:
        """Check /proc/sys/kernel/module.sig_enforce value."""
        try:
            sig_path = Path("/proc/sys/kernel/module.sig_enforce")
            if not sig_path.exists():
                # Also check via /proc/sys/kernel/ — some kernels use different path
                sig_path = Path("/proc/sys/kernel/sig_enforce")
            if sig_path.exists():
                return sig_path.read_text().strip() == "1"
            # Check if lockdown is enabled (provides similar protection)
            lockdown_path = Path("/sys/kernel/security/lockdown")
            if lockdown_path.exists():
                content = lockdown_path.read_text().strip()
                return "[integrity]" in content or "[confidentiality]" in content
        except Exception as exc:
            logger.warning("module_sig_enforce_check_failed", error=str(exc))
        return False

    def _check_suspicious_setuid(self) -> List[str]:
        """Find setuid binaries outside of standard system paths."""
        standard_setuid_prefixes = [
            "/bin/", "/usr/bin/", "/usr/lib/", "/usr/libexec/",
            "/sbin/", "/usr/sbin/", "/usr/local/bin/",
        ]
        suspicious: List[str] = []
        try:
            result = subprocess.run(
                ["find", "/", "-perm", "-4000", "-type", "f",
                 "-not", "-path", "/proc/*", "-not", "-path", "/sys/*"],
                capture_output=True, text=True, timeout=10,
            )
            for path in result.stdout.splitlines():
                path = path.strip()
                if not path:
                    continue
                if not any(path.startswith(prefix) for prefix in standard_setuid_prefixes):
                    suspicious.append(path)
        except Exception as exc:
            logger.warning("setuid_scan_failed", error=str(exc))
        return suspicious

    # ── iOS ────────────────────────────────────────────────────────────────

    def _check_ios(self) -> CheckResult:
        """Detect iOS jailbreak via artifact paths and sandbox write test."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []
        jailbreak_indicators: List[str] = []

        # Check for known jailbreak artifact paths
        for jb_path in IOS_JAILBREAK_PATHS:
            if Path(jb_path).exists():
                jailbreak_indicators.append(jb_path)
        details["jailbreak_paths_found"] = jailbreak_indicators

        # Attempt sandbox escape test — write to /private
        sandbox_broken = self._test_ios_sandbox()
        details["sandbox_broken"] = sandbox_broken
        if sandbox_broken:
            jailbreak_indicators.append("sandbox_escape_write_test")

        # Check environment variables for injection indicators
        suspicious_env = self._check_ios_env_injection()
        details["suspicious_env_vars"] = suspicious_env
        if suspicious_env:
            jailbreak_indicators.append(f"suspicious_env_vars: {', '.join(suspicious_env)}")

        details["jailbreak_indicator_count"] = len(jailbreak_indicators)

        if jailbreak_indicators:
            recommendations.append(
                "iOS jailbreak artifacts detected. "
                f"Indicators: {', '.join(jailbreak_indicators[:5])}. "
                "Device access is blocked. Contact IT Security."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
                immediate_block=True,
            )

        return self._make_result(
            score=10.0,
            details=details,
            recommendations=["No iOS jailbreak indicators detected."],
        )

    def _test_ios_sandbox(self) -> bool:
        """Attempt to write to /private/ to detect sandbox escape."""
        test_path = Path("/private/test_medtrustx_jailbreak_probe")
        try:
            test_path.write_text("probe")
            test_path.unlink()
            return True  # Write succeeded — sandbox is broken
        except (PermissionError, OSError):
            return False  # Expected — sandbox is intact

    def _check_ios_env_injection(self) -> List[str]:
        """Check environment for known jailbreak injection variables."""
        suspicious_vars = [
            "DYLD_INSERT_LIBRARIES",
            "DYLD_LIBRARY_PATH",
            "_MSSafeMode",
            "SUBSTRATE_ENABLED",
        ]
        found = []
        for var in suspicious_vars:
            if os.environ.get(var):
                found.append(var)
        return found

    # ── Android ────────────────────────────────────────────────────────────

    def _check_android(self) -> CheckResult:
        """Detect Android root via su binary, Magisk, build tags, Play Integrity."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []
        root_indicators: List[str] = []

        # Check for su / root binary paths
        for root_path in ANDROID_ROOT_PATHS:
            if Path(root_path).exists():
                root_indicators.append(root_path)
        details["root_paths_found"] = root_indicators

        # Check build tags (must be "release-keys")
        build_tags = os.environ.get("MEDTRUSTX_BUILD_TAGS", "")
        details["build_tags"] = build_tags
        if build_tags and build_tags != "release-keys":
            root_indicators.append(f"build_tags={build_tags}")
            recommendations.append(
                f"Android build tags are '{build_tags}' (expected 'release-keys'). "
                "This indicates a custom ROM or rooted device."
            )

        # Check Play Integrity API result (injected by MDM wrapper)
        meets_device_integrity = os.environ.get(
            "MEDTRUSTX_PLAY_INTEGRITY_DEVICE", ""
        ).lower() == "true"
        meets_basic_integrity = os.environ.get(
            "MEDTRUSTX_PLAY_INTEGRITY_BASIC", ""
        ).lower() == "true"
        details["play_integrity_device"] = meets_device_integrity
        details["play_integrity_basic"] = meets_basic_integrity

        if not meets_basic_integrity:
            root_indicators.append("play_integrity_basic_failed")
            recommendations.append(
                "Google Play Integrity basic check failed. "
                "Device may be rooted or running a custom ROM."
            )
        if not meets_device_integrity:
            root_indicators.append("play_integrity_device_failed")
            recommendations.append(
                "Google Play Integrity device check failed. "
                "Device does not meet Google hardware attestation requirements."
            )

        details["root_indicator_count"] = len(root_indicators)

        if root_indicators:
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations or [
                    f"Android root indicators found: {', '.join(root_indicators[:5])}. "
                    "Device access is blocked."
                ],
                immediate_block=True,
            )

        return self._make_result(
            score=10.0,
            details=details,
            recommendations=["No Android root indicators detected."],
        )
