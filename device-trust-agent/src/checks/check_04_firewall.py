"""
MedTrustX Device Trust Agent — Check 04: Firewall Status (weight: 8%).

Verifies host-based firewall is active and configured with appropriate
policies on all profiles/networks. Mobile platforms score 7 when MDM
enrolled (firewall managed at MDM level).

Scoring:
  10 — firewall active, all profiles, default-deny policy
   7 — firewall active, default config
   4 — firewall present but not all profiles active
   1 — firewall disabled or not found
"""

from __future__ import annotations

import asyncio
import os
import re
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import structlog

from src.checks.base_check import BaseCheck
from src.models.check_result import CheckResult
from src.platform_detector import Platform

logger = structlog.get_logger(__name__)


class FirewallCheck(BaseCheck):
    """Check 04 — Firewall Status.

    Evaluates whether the host-based firewall is active and properly
    configured across all network profiles.
    """

    CHECK_ID = 4
    CHECK_NAME = "Firewall Status"
    WEIGHT = 0.08
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
        """Dispatch to platform-specific firewall check."""
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
        """Check Windows Firewall status across all three profiles via netsh."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        profile_states = self._query_windows_firewall_profiles()
        details["profiles"] = profile_states

        required_profiles = ["Domain", "Private", "Public"]
        all_on = all(
            profile_states.get(p, {}).get("state", "").upper() == "ON"
            for p in required_profiles
        )
        details["all_profiles_enabled"] = all_on

        # Check for default-deny inbound policy on Public profile
        public_profile = profile_states.get("Public", {})
        default_deny = public_profile.get("inbound_action", "").upper() in (
            "BLOCK", "BLOCKINBOUND", "BLOCK (DEFAULT)"
        )
        details["public_default_deny_inbound"] = default_deny

        if not any(
            profile_states.get(p, {}).get("state", "").upper() == "ON"
            for p in required_profiles
        ):
            recommendations.append(
                "Windows Firewall is disabled on all profiles. "
                "Enable via: netsh advfirewall set allprofiles state on"
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        if not all_on:
            disabled_profiles = [
                p for p in required_profiles
                if profile_states.get(p, {}).get("state", "").upper() != "ON"
            ]
            recommendations.append(
                f"Windows Firewall is disabled for profiles: {', '.join(disabled_profiles)}. "
                "Enable: netsh advfirewall set allprofiles state on"
            )
            return self._make_result(
                score=4.0,
                details=details,
                recommendations=recommendations,
            )

        if all_on and default_deny:
            return self._make_result(
                score=10.0,
                details=details,
                recommendations=["Windows Firewall is active on all profiles with default-deny inbound."],
            )

        return self._make_result(
            score=7.0,
            details=details,
            recommendations=["Windows Firewall is active. Consider setting default-deny inbound on all profiles."],
        )

    def _query_windows_firewall_profiles(self) -> Dict[str, Dict[str, str]]:
        """Run netsh advfirewall show allprofiles and parse output."""
        profiles: Dict[str, Dict[str, str]] = {}
        try:
            result = subprocess.run(
                ["netsh", "advfirewall", "show", "allprofiles"],
                capture_output=True, text=True, timeout=10,
            )
            output = result.stdout

            # Parse profile blocks
            current_profile = None
            for line in output.splitlines():
                # Profile header: "Domain Profile Settings:" etc.
                profile_match = re.match(r"^(Domain|Private|Public)\s+Profile", line, re.IGNORECASE)
                if profile_match:
                    current_profile = profile_match.group(1).capitalize()
                    profiles[current_profile] = {}
                    continue
                if current_profile and line.strip():
                    # State line
                    state_match = re.match(r"^\s*State\s+(.+)", line, re.IGNORECASE)
                    if state_match:
                        profiles[current_profile]["state"] = state_match.group(1).strip()
                    # Inbound default action
                    inbound_match = re.match(
                        r"^\s*Firewall Policy\s+(.+)", line, re.IGNORECASE
                    )
                    if inbound_match:
                        policy = inbound_match.group(1).strip()
                        # Format: "BlockInbound,AllowOutbound"
                        inbound_action = policy.split(",")[0].strip()
                        profiles[current_profile]["inbound_action"] = inbound_action
        except Exception as exc:
            logger.warning("netsh_firewall_query_failed", error=str(exc))
            # Try PowerShell fallback
            try:
                result = subprocess.run(
                    [
                        "powershell", "-NoProfile", "-NonInteractive", "-Command",
                        "Get-NetFirewallProfile | Select-Object Name, Enabled, "
                        "DefaultInboundAction | ConvertTo-Json"
                    ],
                    capture_output=True, text=True, timeout=10,
                )
                import json
                fw_data = json.loads(result.stdout.strip())
                if not isinstance(fw_data, list):
                    fw_data = [fw_data]
                for profile in fw_data:
                    name = profile.get("Name", "Unknown")
                    profiles[name] = {
                        "state": "ON" if profile.get("Enabled") else "OFF",
                        "inbound_action": profile.get("DefaultInboundAction", ""),
                    }
            except Exception as inner_exc:
                logger.warning("powershell_firewall_query_failed", error=str(inner_exc))
        return profiles

    # ── macOS ──────────────────────────────────────────────────────────────

    def _check_macos(self) -> CheckResult:
        """Check macOS Application Firewall and optionally pf status."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        socketfilterfw_path = (
            "/usr/libexec/ApplicationFirewall/socketfilterfw"
        )

        # Check Application Firewall global state
        try:
            result = subprocess.run(
                [socketfilterfw_path, "--getglobalstate"],
                capture_output=True, text=True, timeout=5,
            )
            output = result.stdout.strip()
            details["socketfilterfw_output"] = output
            fw_enabled = "enabled" in output.lower()
            details["application_firewall_enabled"] = fw_enabled
        except Exception as exc:
            logger.warning("socketfilterfw_failed", error=str(exc))
            fw_enabled = False
            details["error"] = str(exc)

        # Check block all incoming connections setting
        stealth_mode = False
        block_all = False
        try:
            stealth_result = subprocess.run(
                [socketfilterfw_path, "--getstealthmode"],
                capture_output=True, text=True, timeout=5,
            )
            stealth_mode = "enabled" in stealth_result.stdout.lower()
            details["stealth_mode_enabled"] = stealth_mode

            block_result = subprocess.run(
                [socketfilterfw_path, "--getblockall"],
                capture_output=True, text=True, timeout=5,
            )
            block_all = "enabled" in block_result.stdout.lower()
            details["block_all_incoming"] = block_all
        except Exception as exc:
            logger.warning("socketfilterfw_options_failed", error=str(exc))

        # Check if pf (packet filter) is also enabled
        pf_enabled = self._check_macos_pf()
        details["pf_enabled"] = pf_enabled

        if not fw_enabled:
            recommendations.append(
                "macOS Application Firewall is disabled. "
                "Enable via: System Settings → Network → Firewall. "
                "Or: sudo /usr/libexec/ApplicationFirewall/socketfilterfw "
                "--setglobalstate on"
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        if fw_enabled and (stealth_mode or block_all or pf_enabled):
            return self._make_result(
                score=10.0,
                details=details,
                recommendations=["Application Firewall is active with hardened configuration."],
            )

        return self._make_result(
            score=7.0,
            details=details,
            recommendations=[
                "Application Firewall is active. "
                "Consider enabling Stealth Mode for additional protection: "
                "sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on"
            ],
        )

    def _check_macos_pf(self) -> bool:
        """Check if pf (packet filter) is enabled on macOS."""
        try:
            result = subprocess.run(
                ["pfctl", "-s", "info"],
                capture_output=True, text=True, timeout=5,
            )
            return "Enabled" in result.stdout
        except Exception:
            return False

    # ── Linux ──────────────────────────────────────────────────────────────

    def _check_linux(self) -> CheckResult:
        """Check ufw/iptables/nftables firewall on Linux."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # Try ufw first (Ubuntu/Debian)
        ufw_status = self._check_ufw()
        details["ufw"] = ufw_status

        # Try iptables
        iptables_status = self._check_iptables()
        details["iptables"] = iptables_status

        # Try nftables
        nftables_status = self._check_nftables()
        details["nftables"] = nftables_status

        if ufw_status.get("active") and ufw_status.get("default_deny"):
            return self._make_result(
                score=10.0,
                details=details,
                recommendations=["ufw is active with default-deny incoming policy."],
            )

        if ufw_status.get("active"):
            return self._make_result(
                score=7.0,
                details=details,
                recommendations=[
                    "ufw is active. "
                    "Consider setting default-deny: sudo ufw default deny incoming"
                ],
            )

        if iptables_status.get("active") and iptables_status.get("default_deny"):
            return self._make_result(
                score=10.0,
                details=details,
                recommendations=["iptables is active with default-deny INPUT policy."],
            )

        if iptables_status.get("active"):
            return self._make_result(
                score=7.0,
                details=details,
                recommendations=[
                    "iptables rules are present. "
                    "Verify default INPUT policy is DROP: "
                    "sudo iptables -P INPUT DROP"
                ],
            )

        if nftables_status.get("active") and nftables_status.get("default_deny"):
            return self._make_result(
                score=10.0,
                details=details,
                recommendations=["nftables is active with default-deny policy."],
            )

        if nftables_status.get("active"):
            return self._make_result(
                score=7.0,
                details=details,
                recommendations=["nftables is active. Verify default-deny policy."],
            )

        recommendations.append(
            "No firewall detected on this Linux system. "
            "Enable ufw: sudo apt-get install ufw && sudo ufw enable && "
            "sudo ufw default deny incoming && sudo ufw default allow outgoing"
        )
        return self._make_result(
            score=1.0,
            details=details,
            recommendations=recommendations,
        )

    def _check_ufw(self) -> Dict[str, Any]:
        """Check ufw (Uncomplicated Firewall) status."""
        try:
            result = subprocess.run(
                ["ufw", "status", "verbose"],
                capture_output=True, text=True, timeout=5,
            )
            output = result.stdout
            active = "Status: active" in output
            default_deny = "Default: deny (incoming)" in output or "deny" in output.lower()
            rules = [
                line.strip() for line in output.splitlines()
                if line.strip() and not line.startswith("Status") and not line.startswith("To")
            ]
            return {
                "active": active,
                "default_deny": default_deny,
                "rules_count": len(rules),
            }
        except FileNotFoundError:
            return {"active": False, "not_installed": True}
        except Exception as exc:
            logger.warning("ufw_status_failed", error=str(exc))
            return {"active": False, "error": str(exc)}

    def _check_iptables(self) -> Dict[str, Any]:
        """Check iptables rules and default policy."""
        try:
            result = subprocess.run(
                ["iptables", "-L", "-n", "--line-numbers"],
                capture_output=True, text=True, timeout=5,
            )
            output = result.stdout
            # Count non-header lines as rules
            rule_lines = [
                line for line in output.splitlines()
                if line and not line.startswith("Chain") and not line.startswith("target")
                and not line.startswith("num")
            ]
            has_rules = len(rule_lines) > 0
            # Check if default INPUT policy is DROP
            default_deny = bool(re.search(r"Chain INPUT.*policy DROP", output))
            return {
                "active": has_rules,
                "default_deny": default_deny,
                "rule_count": len(rule_lines),
            }
        except FileNotFoundError:
            return {"active": False, "not_installed": True}
        except PermissionError:
            # iptables requires root — if we can't read, assume it might be active
            return {"active": True, "default_deny": False, "permission_denied": True}
        except Exception as exc:
            logger.warning("iptables_check_failed", error=str(exc))
            return {"active": False, "error": str(exc)}

    def _check_nftables(self) -> Dict[str, Any]:
        """Check nftables ruleset."""
        try:
            result = subprocess.run(
                ["nft", "list", "ruleset"],
                capture_output=True, text=True, timeout=5,
            )
            output = result.stdout.strip()
            has_rules = bool(output) and "table" in output
            default_deny = "policy drop" in output.lower() or "drop" in output.lower()
            return {
                "active": has_rules,
                "default_deny": default_deny,
            }
        except FileNotFoundError:
            return {"active": False, "not_installed": True}
        except Exception as exc:
            logger.warning("nft_check_failed", error=str(exc))
            return {"active": False, "error": str(exc)}

    # ── iOS ────────────────────────────────────────────────────────────────

    def _check_ios(self) -> CheckResult:
        """iOS firewall is managed at MDM level — score 7 if MDM enrolled."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        mdm_enrolled = self._platform_info.mdm_enrolled
        details["mdm_enrolled"] = mdm_enrolled
        details["note"] = "iOS does not have a traditional host-based firewall. " \
                          "Network security is managed at the MDM and network layer."

        if mdm_enrolled:
            return self._make_result(
                score=7.0,
                details=details,
                recommendations=["iOS firewall policies are enforced via MDM profile."],
            )

        recommendations.append(
            "iOS device is not MDM-enrolled. "
            "Network security policies cannot be verified. "
            "Enroll in MedTrustX MDM."
        )
        return self._make_result(
            score=1.0,
            details=details,
            recommendations=recommendations,
        )

    # ── Android ────────────────────────────────────────────────────────────

    def _check_android(self) -> CheckResult:
        """Android firewall is managed at MDM level — score 7 if MDM enrolled."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        mdm_enrolled = self._platform_info.mdm_enrolled
        details["mdm_enrolled"] = mdm_enrolled
        details["note"] = "Android does not have a traditional host-based firewall. " \
                          "Network security is managed at the MDM and network layer."

        # Check for VPN-based firewall (Android 7+ supports always-on VPN)
        always_on_vpn = os.environ.get("MEDTRUSTX_ALWAYS_ON_VPN", "").lower() == "true"
        details["always_on_vpn"] = always_on_vpn

        if mdm_enrolled and always_on_vpn:
            return self._make_result(
                score=10.0,
                details=details,
                recommendations=["Android MDM always-on VPN provides network firewall."],
            )

        if mdm_enrolled:
            return self._make_result(
                score=7.0,
                details=details,
                recommendations=["Android firewall policies are enforced via MDM profile."],
            )

        recommendations.append(
            "Android device is not MDM-enrolled. "
            "Network security policies cannot be enforced. "
            "Enroll in MedTrustX MDM."
        )
        return self._make_result(
            score=1.0,
            details=details,
            recommendations=recommendations,
        )
