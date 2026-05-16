"""
MedTrustX Device Trust Agent — Check 02: Antivirus / EDR Status (weight: 15%).

Detects installed and active security software per platform, verifies
definition currency, and distinguishes enterprise EDR (highest score)
from standard AV from disabled/absent AV (lowest score).

Scoring:
  10 — enterprise EDR (CrowdStrike/SentinelOne) active + updated
   8 — standard AV active + definitions < 24h old
   5 — AV present but definitions > 48h old
   3 — AV installed but disabled or not running
   1 — no AV/EDR detected
"""

from __future__ import annotations

import asyncio
import os
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

# ── Known enterprise EDR registry keys (Windows) ──────────────────────────
WINDOWS_EDR_REGISTRY_KEYS = {
    "CrowdStrike": [
        r"SYSTEM\CrowdStrike",
        r"SOFTWARE\CrowdStrike\Sensor Platform",
    ],
    "SentinelOne": [
        r"SOFTWARE\SentinelOne",
        r"SYSTEM\CurrentControlSet\Services\SentinelAgent",
    ],
    "CarbonBlack": [
        r"SOFTWARE\Carbon Black",
        r"SOFTWARE\CarbonBlack\SensorInstall",
    ],
    "MicrosoftDefenderATP": [
        r"SOFTWARE\Microsoft\Windows Advanced Threat Protection",
    ],
    "Cylance": [
        r"SOFTWARE\Cylance\Desktop",
    ],
    "Sophos": [
        r"SOFTWARE\Sophos",
    ],
}

# ── Known enterprise EDR process names ────────────────────────────────────
EDR_PROCESSES_WINDOWS = {
    "CrowdStrike": ["csfalconservice.exe", "csfalconcontainer.exe", "falcon-sensor.exe"],
    "SentinelOne": ["sentinelagent.exe", "sentinelhelperservice.exe", "sentinelservicehost.exe"],
    "CarbonBlack": ["cbdefense.exe", "cb.exe", "cbsensor.exe"],
    "Cylance": ["cylancesvc.exe"],
    "Sophos": ["sophosav.exe", "sophosfs.exe", "sophosssp.exe"],
    "MicrosoftDefenderATP": ["msmpeng.exe", "mssense.exe"],
}

EDR_PROCESSES_MACOS = {
    "CrowdStrike": ["falcon", "com.crowdstrike.falcon.Agent"],
    "SentinelOne": ["SentinelAgent", "sentineld"],
    "CarbonBlack": ["cbagentd", "CbOsxSensorService"],
    "Sophos": ["sophosav", "SophosAntiVirus"],
    "MalwareBytes": ["RTProtectionDaemon", "MBFrontendHelper"],
}

EDR_PROCESSES_LINUX = {
    "CrowdStrike": ["falcon-sensor", "falcond"],
    "SentinelOne": ["sentineld", "SentinelAgent"],
    "ClamAV": ["clamd", "freshclam"],
    "Sophos": ["sav-protect", "sav-rms"],
    "ESET": ["esets_daemon", "esets_scan"],
}

# ── macOS XProtect plist path ──────────────────────────────────────────────
XPROTECT_META_PLIST = (
    "/Library/Apple/System/Library/CoreServices/"
    "XProtect.bundle/Contents/Resources/XProtect.meta.plist"
)

# Enterprise EDR names — any of these found and running → score 10
ENTERPRISE_EDR_NAMES = {"CrowdStrike", "SentinelOne", "CarbonBlack",
                        "MicrosoftDefenderATP", "Cylance"}


class AntivirusCheck(BaseCheck):
    """Check 02 — Antivirus / EDR Status.

    Evaluates whether the device has active, current security software
    capable of detecting and blocking malware and endpoint threats.
    """

    CHECK_ID = 2
    CHECK_NAME = "Antivirus / EDR Status"
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
        """Dispatch to platform-specific AV/EDR check."""
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
        """Check Windows AV/EDR via WMI, Defender PowerShell, and registry."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        detected_products: List[Dict[str, Any]] = []

        # Query WMI AntiVirusProduct (SecurityCenter2)
        wmi_products = self._query_windows_wmi_av()
        details["wmi_av_products"] = wmi_products
        detected_products.extend(wmi_products)

        # Query Windows Defender status via PowerShell
        defender_status = self._query_windows_defender()
        details["windows_defender"] = defender_status
        if defender_status.get("enabled"):
            detected_products.append({
                "name": "Windows Defender",
                "enabled": True,
                "definitions_age_hours": defender_status.get("definitions_age_hours"),
                "product_type": "standard",
            })

        # Check known EDR registry keys
        edr_registry_findings = self._check_edr_registry()
        details["edr_registry"] = edr_registry_findings

        # Check known EDR processes
        edr_process_findings = self._check_edr_processes_windows()
        details["edr_processes"] = edr_process_findings

        return self._score_av_findings(
            detected_products=detected_products,
            edr_registry=edr_registry_findings,
            edr_processes=edr_process_findings,
            details=details,
            recommendations=recommendations,
        )

    def _query_windows_wmi_av(self) -> List[Dict[str, Any]]:
        """Query WMI SecurityCenter2 for installed AV products."""
        products = []
        try:
            import wmi  # type: ignore[import]
            c = wmi.WMI(namespace="root\\SecurityCenter2")
            for av in c.AntiVirusProduct():
                # productState encodes enabled/disabled and definition age
                # Bits 12-19 of productState: AV engine state
                # Bits 20-27: AV definitions state
                product_state = int(getattr(av, "productState", 0))
                engine_state = (product_state >> 12) & 0xF
                definition_state = (product_state >> 4) & 0xF
                enabled = engine_state == 1
                up_to_date = definition_state == 0
                products.append({
                    "name": getattr(av, "displayName", "Unknown"),
                    "path": getattr(av, "pathToSignedProductExe", ""),
                    "enabled": enabled,
                    "up_to_date": up_to_date,
                    "product_state": product_state,
                    "product_type": "standard",
                })
        except Exception as exc:
            logger.warning("wmi_av_query_failed", error=str(exc))
        return products

    def _query_windows_defender(self) -> Dict[str, Any]:
        """Query Windows Defender status and definition age via PowerShell."""
        try:
            result = subprocess.run(
                [
                    "powershell", "-NoProfile", "-NonInteractive", "-Command",
                    "Get-MpComputerStatus | Select-Object AMRunningMode, "
                    "AMServiceEnabled, AntispywareEnabled, AntivirusEnabled, "
                    "NISEnabled, RealTimeProtectionEnabled, "
                    "AntivirusSignatureLastUpdated | ConvertTo-Json"
                ],
                capture_output=True, text=True, timeout=15,
            )
            import json
            status = json.loads(result.stdout.strip())
            enabled = bool(status.get("AntivirusEnabled") or status.get("RealTimeProtectionEnabled"))
            # Parse signature last updated
            sig_updated_str = status.get("AntivirusSignatureLastUpdated", "")
            definitions_age_hours = None
            if sig_updated_str:
                try:
                    # PowerShell date format: /Date(milliseconds)/
                    match = re.search(r"/Date\((\d+)\)/", sig_updated_str)
                    if match:
                        ms = int(match.group(1))
                        sig_date = datetime.fromtimestamp(ms / 1000, tz=timezone.utc)
                        definitions_age_hours = (
                            datetime.now(timezone.utc) - sig_date
                        ).total_seconds() / 3600
                except Exception:
                    pass
            return {
                "enabled": enabled,
                "real_time_protection": bool(status.get("RealTimeProtectionEnabled")),
                "definitions_age_hours": round(definitions_age_hours, 1) if definitions_age_hours else None,
                "am_service_enabled": bool(status.get("AMServiceEnabled")),
            }
        except Exception as exc:
            logger.warning("defender_status_query_failed", error=str(exc))
            return {"enabled": False, "error": str(exc)}

    def _check_edr_registry(self) -> Dict[str, bool]:
        """Check for known EDR agent registry keys."""
        findings: Dict[str, bool] = {}
        try:
            import winreg  # type: ignore[import]
            for edr_name, reg_keys in WINDOWS_EDR_REGISTRY_KEYS.items():
                found = False
                for reg_key in reg_keys:
                    try:
                        key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, reg_key)
                        winreg.CloseKey(key)
                        found = True
                        break
                    except FileNotFoundError:
                        continue
                    except Exception:
                        continue
                findings[edr_name] = found
        except ImportError:
            pass
        return findings

    def _check_edr_processes_windows(self) -> Dict[str, bool]:
        """Check if known EDR agent processes are running."""
        findings: Dict[str, bool] = {}
        try:
            result = subprocess.run(
                ["tasklist", "/FO", "CSV", "/NH"],
                capture_output=True, text=True, timeout=10,
            )
            running_processes = {
                line.split(",")[0].strip('"').lower()
                for line in result.stdout.splitlines()
                if line
            }
            for edr_name, process_names in EDR_PROCESSES_WINDOWS.items():
                findings[edr_name] = any(
                    p.lower() in running_processes for p in process_names
                )
        except Exception as exc:
            logger.warning("tasklist_failed", error=str(exc))
        return findings

    def _score_av_findings(
        self,
        detected_products: List[Dict[str, Any]],
        edr_registry: Dict[str, bool],
        edr_processes: Dict[str, bool],
        details: Dict[str, Any],
        recommendations: List[str],
    ) -> CheckResult:
        """Score AV findings across all Windows detection methods."""
        # Check for enterprise EDR confirmed by both registry and process
        for edr_name in ENTERPRISE_EDR_NAMES:
            registry_found = edr_registry.get(edr_name, False)
            process_running = edr_processes.get(edr_name, False)
            if registry_found and process_running:
                details["enterprise_edr"] = edr_name
                details["edr_active"] = True
                return self._make_result(
                    score=10.0,
                    details=details,
                    recommendations=["Enterprise EDR is active and protecting this device."],
                )

        # Check for any enabled AV product
        enabled_products = [p for p in detected_products if p.get("enabled")]
        if not enabled_products:
            disabled_products = [p for p in detected_products if not p.get("enabled")]
            if disabled_products:
                recommendations.append(
                    f"Antivirus '{disabled_products[0]['name']}' is installed but disabled. "
                    "Re-enable it immediately via Windows Security."
                )
                return self._make_result(
                    score=3.0,
                    details=details,
                    recommendations=recommendations,
                )
            recommendations.append(
                "No antivirus or EDR software detected. "
                "Install Microsoft Defender or a corporate-approved EDR solution."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        # AV is enabled — check definition age
        best_product = enabled_products[0]
        def_age_hours = best_product.get("definitions_age_hours")
        details["best_av_product"] = best_product.get("name")
        details["definition_age_hours"] = def_age_hours

        if def_age_hours is None:
            score = 5.0
            recommendations.append(
                f"'{best_product['name']}' is active but definition age is unknown. "
                "Verify definitions are being updated."
            )
        elif def_age_hours > 48:
            score = 5.0
            recommendations.append(
                f"'{best_product['name']}' definitions are {def_age_hours:.1f}h old. "
                "Update definitions immediately."
            )
        elif def_age_hours <= 24:
            score = 8.0
            recommendations.append(
                f"'{best_product['name']}' is active with current definitions."
            )
        else:
            score = 6.0
            recommendations.append(
                f"'{best_product['name']}' definitions are {def_age_hours:.1f}h old. "
                "Update soon."
            )

        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations,
        )

    # ── macOS ──────────────────────────────────────────────────────────────

    def _check_macos(self) -> CheckResult:
        """Check macOS AV/EDR via process list, launchctl, and XProtect."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # Get running processes
        running_processes = self._get_macos_running_processes()
        details["running_process_count"] = len(running_processes)

        # Check for known EDR agents
        detected_edr: Dict[str, bool] = {}
        for edr_name, process_names in EDR_PROCESSES_MACOS.items():
            running = any(
                p.lower() in running_processes for p in process_names
            )
            detected_edr[edr_name] = running
        details["detected_edr"] = detected_edr

        # Check XProtect
        xprotect_status = self._check_macos_xprotect()
        details["xprotect"] = xprotect_status

        # Score based on findings
        # Enterprise EDR running?
        for edr_name in ENTERPRISE_EDR_NAMES:
            if detected_edr.get(edr_name, False):
                details["enterprise_edr"] = edr_name
                return self._make_result(
                    score=10.0,
                    details=details,
                    recommendations=["Enterprise EDR is active on this device."],
                )

        # Check launchctl for AV daemons
        av_daemons = self._check_macos_av_daemons()
        details["av_daemons"] = av_daemons

        any_av_running = any(detected_edr.values()) or any(av_daemons.values())

        if not any_av_running and not xprotect_status.get("enabled"):
            recommendations.append(
                "No antivirus or EDR agent detected on macOS. "
                "Install a corporate-approved EDR solution (e.g., CrowdStrike Falcon)."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        # XProtect present and enabled
        if xprotect_status.get("enabled"):
            xp_age_days = xprotect_status.get("definition_age_days")
            if xp_age_days is not None and xp_age_days > 2:
                score = 5.0
                recommendations.append(
                    f"XProtect definitions are {xp_age_days} days old. "
                    "Enable automatic macOS updates to keep XProtect current."
                )
            elif any_av_running:
                score = 8.0
                recommendations.append("Third-party AV and XProtect are both active.")
            else:
                score = 7.0
                recommendations.append("XProtect is active. Consider adding enterprise EDR.")
        else:
            score = 5.0
            recommendations.append(
                "XProtect status could not be verified. "
                "Ensure macOS Gatekeeper is enabled."
            )

        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations,
        )

    def _get_macos_running_processes(self) -> set:
        """Return set of lowercase process names currently running."""
        try:
            result = subprocess.run(
                ["ps", "aux"],
                capture_output=True, text=True, timeout=10,
            )
            processes = set()
            for line in result.stdout.splitlines()[1:]:  # skip header
                parts = line.split()
                if len(parts) > 10:
                    cmd = Path(parts[10]).name.lower()
                    processes.add(cmd)
            return processes
        except Exception as exc:
            logger.warning("ps_aux_failed", error=str(exc))
            return set()

    def _check_macos_av_daemons(self) -> Dict[str, bool]:
        """Check launchctl for AV service daemons."""
        known_av_daemons = [
            "com.crowdstrike.falcon",
            "com.sentinelone.sentineld",
            "com.carbonblack.cbsensor",
            "com.sophos.autoupdate",
            "com.malwarebytes.rtprotection",
        ]
        findings: Dict[str, bool] = {}
        try:
            result = subprocess.run(
                ["launchctl", "list"],
                capture_output=True, text=True, timeout=10,
            )
            output = result.stdout.lower()
            for daemon in known_av_daemons:
                findings[daemon] = daemon in output
        except Exception as exc:
            logger.warning("launchctl_list_failed", error=str(exc))
        return findings

    def _check_macos_xprotect(self) -> Dict[str, Any]:
        """Verify XProtect is enabled and check definition age."""
        plist_path = Path(XPROTECT_META_PLIST)
        if not plist_path.exists():
            return {"enabled": False, "reason": "XProtect plist not found"}
        try:
            import plistlib
            with open(plist_path, "rb") as f:
                meta = plistlib.load(f)
            # XProtect meta plist contains LastModification timestamp
            last_mod = meta.get("LastModification") or meta.get("Version")
            definition_age_days = None
            if isinstance(last_mod, datetime):
                if last_mod.tzinfo is None:
                    last_mod = last_mod.replace(tzinfo=timezone.utc)
                definition_age_days = (datetime.now(timezone.utc) - last_mod).days
            return {
                "enabled": True,
                "version": meta.get("Version", "unknown"),
                "last_modification": last_mod.isoformat() if isinstance(last_mod, datetime) else str(last_mod),
                "definition_age_days": definition_age_days,
            }
        except Exception as exc:
            logger.warning("xprotect_plist_read_failed", error=str(exc))
            return {"enabled": False, "error": str(exc)}

    # ── Linux ──────────────────────────────────────────────────────────────

    def _check_linux(self) -> CheckResult:
        """Check Linux AV/EDR via running processes and systemd services."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # Get running processes
        running_processes = self._get_linux_running_processes()
        details["running_process_count"] = len(running_processes)

        # Check for known EDR/AV agents
        detected: Dict[str, bool] = {}
        for av_name, process_names in EDR_PROCESSES_LINUX.items():
            running = any(p.lower() in running_processes for p in process_names)
            detected[av_name] = running
        details["detected_av"] = detected

        # Check systemctl for AV services
        av_service_status = self._check_linux_av_services()
        details["av_services"] = av_service_status

        # Enterprise EDR check
        for edr_name in {"CrowdStrike", "SentinelOne"}:
            if detected.get(edr_name, False):
                details["enterprise_edr"] = edr_name
                return self._make_result(
                    score=10.0,
                    details=details,
                    recommendations=["Enterprise EDR is active on this Linux device."],
                )

        # ClamAV check with freshclam currency
        if detected.get("ClamAV", False) or av_service_status.get("clamav-daemon", False):
            freshclam_age = self._get_clamav_definition_age()
            details["clamav_definition_age_hours"] = freshclam_age
            if freshclam_age is None:
                score = 5.0
                recommendations.append(
                    "ClamAV is running but definition age is unknown. "
                    "Run: sudo freshclam"
                )
            elif freshclam_age > 48:
                score = 5.0
                recommendations.append(
                    f"ClamAV definitions are {freshclam_age:.1f}h old. "
                    "Run: sudo freshclam"
                )
            elif freshclam_age <= 24:
                score = 8.0
                recommendations.append("ClamAV is active with current definitions.")
            else:
                score = 6.0
                recommendations.append(
                    f"ClamAV definitions are {freshclam_age:.1f}h old. "
                    "Run freshclam to update."
                )
        elif any(detected.values()) or any(av_service_status.values()):
            score = 7.0
            recommendations.append("Security software detected but not a recognized enterprise EDR.")
        else:
            score = 1.0
            recommendations.append(
                "No AV or EDR detected on Linux. "
                "Install CrowdStrike Falcon for Linux or ClamAV: "
                "sudo apt-get install clamav clamav-daemon"
            )

        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations,
        )

    def _get_linux_running_processes(self) -> set:
        """Return set of lowercase process names from /proc."""
        processes = set()
        try:
            proc = Path("/proc")
            for pid_dir in proc.iterdir():
                if pid_dir.name.isdigit():
                    comm_file = pid_dir / "comm"
                    try:
                        processes.add(comm_file.read_text().strip().lower())
                    except OSError:
                        continue
        except Exception as exc:
            logger.warning("proc_scan_failed", error=str(exc))
        return processes

    def _check_linux_av_services(self) -> Dict[str, bool]:
        """Check systemctl for known AV service states."""
        services = ["clamav-daemon", "clamav-freshclam", "falcon-sensor",
                    "sentineld", "sav-protect"]
        status: Dict[str, bool] = {}
        for service in services:
            try:
                result = subprocess.run(
                    ["systemctl", "is-active", service],
                    capture_output=True, text=True, timeout=5,
                )
                status[service] = result.stdout.strip() == "active"
            except Exception:
                status[service] = False
        return status

    def _get_clamav_definition_age(self) -> Optional[float]:
        """Return ClamAV definition age in hours by checking freshclam log."""
        freshclam_log = Path("/var/log/clamav/freshclam.log")
        if not freshclam_log.exists():
            freshclam_log = Path("/var/log/freshclam.log")
        if freshclam_log.exists():
            try:
                result = subprocess.run(
                    ["tail", "-20", str(freshclam_log)],
                    capture_output=True, text=True, timeout=5,
                )
                # Look for last successful update line
                for line in reversed(result.stdout.splitlines()):
                    match = re.search(r"(\w{3}\s+\d+\s+\d{2}:\d{2}:\d{2}\s+\d{4})", line)
                    if match and ("updated" in line.lower() or "up to date" in line.lower()):
                        try:
                            update_time = datetime.strptime(
                                match.group(1), "%a %b %d %H:%M:%S %Y"
                            ).replace(tzinfo=timezone.utc)
                            age = (datetime.now(timezone.utc) - update_time).total_seconds() / 3600
                            return round(age, 1)
                        except ValueError:
                            continue
            except Exception as exc:
                logger.warning("freshclam_log_parse_failed", error=str(exc))
        # Check daily.cld or main.cvd modification time
        for cvd_path in ["/var/lib/clamav/daily.cld", "/var/lib/clamav/daily.cvd"]:
            p = Path(cvd_path)
            if p.exists():
                mtime = p.stat().st_mtime
                age_hours = (datetime.now(timezone.utc).timestamp() - mtime) / 3600
                return round(age_hours, 1)
        return None

    # ── iOS ────────────────────────────────────────────────────────────────

    def _check_ios(self) -> CheckResult:
        """Check iOS MDM enrollment status (iOS has no traditional AV)."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        mdm_enrolled = self._platform_info.mdm_enrolled
        details["mdm_enrolled"] = mdm_enrolled

        if mdm_enrolled:
            details["mdm_device_id"] = self._platform_info.mdm_device_id
            # iOS with MDM enrollment is equivalent to managed device — score based
            # on MDM compliance status from environment
            compliance_status = os.environ.get("MEDTRUSTX_MDM_COMPLIANCE", "unknown").lower()
            details["mdm_compliance"] = compliance_status
            if compliance_status == "compliant":
                return self._make_result(
                    score=8.0,
                    details=details,
                    recommendations=["iOS device is MDM-enrolled and compliant."],
                )
            elif compliance_status == "non_compliant":
                recommendations.append(
                    "iOS MDM compliance check failed. Review MDM policy violations."
                )
                return self._make_result(
                    score=3.0,
                    details=details,
                    recommendations=recommendations,
                )
            else:
                return self._make_result(
                    score=6.0,
                    details=details,
                    recommendations=["iOS MDM compliance status unknown. Verify MDM connectivity."],
                )
        else:
            recommendations.append(
                "iOS device is not enrolled in MDM. "
                "Enroll in MedTrustX MDM to enable security policy enforcement."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

    # ── Android ────────────────────────────────────────────────────────────

    def _check_android(self) -> CheckResult:
        """Check Android Google Play Protect status via MDM API."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        mdm_enrolled = self._platform_info.mdm_enrolled
        details["mdm_enrolled"] = mdm_enrolled

        # Play Protect status injected by MDM wrapper
        play_protect_enabled = os.environ.get(
            "MEDTRUSTX_PLAY_PROTECT_ENABLED", ""
        ).lower() == "true"
        play_protect_updated = os.environ.get(
            "MEDTRUSTX_PLAY_PROTECT_UPDATED", ""
        ).lower() == "true"
        details["play_protect_enabled"] = play_protect_enabled
        details["play_protect_updated"] = play_protect_updated

        if not mdm_enrolled:
            recommendations.append(
                "Android device is not MDM-enrolled. "
                "Enroll via MedTrustX MDM to enable Play Protect reporting."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        if not play_protect_enabled:
            recommendations.append(
                "Google Play Protect is disabled. "
                "Enable via Settings → Security → Google Play Protect."
            )
            return self._make_result(
                score=3.0,
                details=details,
                recommendations=recommendations,
            )

        if play_protect_enabled and play_protect_updated:
            return self._make_result(
                score=8.0,
                details=details,
                recommendations=["Google Play Protect is active and up to date."],
            )

        recommendations.append(
            "Google Play Protect is enabled but definitions may be stale. "
            "Open Play Store and run a manual scan."
        )
        return self._make_result(
            score=5.0,
            details=details,
            recommendations=recommendations,
        )
