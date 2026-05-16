"""
MedTrustX Device Trust Agent — Check 08: Network Security Posture (weight: 8%).

Evaluates the risk of the current network environment by detecting
corporate network membership, VPN status, WiFi encryption strength,
DNS server legitimacy, and presence on known threat-listed networks.

Scoring:
  10 — corporate network + VPN active + WPA3
   8 — corporate network, WPA2, known DNS
   6 — VPN active on public network
   4 — public WiFi, WPA2, no VPN
   2 — open WiFi (no encryption) with no VPN
   1 — known malicious network (IP in threat blocklist)
"""

from __future__ import annotations

import asyncio
import ipaddress
import os
import re
import socket
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import structlog

from src.checks.base_check import BaseCheck
from src.models.check_result import CheckResult
from src.platform_detector import Platform

logger = structlog.get_logger(__name__)

# Corporate IP range — traffic from this range is considered trusted
CORPORATE_CIDR = ipaddress.ip_network("10.0.0.0/8", strict=False)

# Approved DNS servers
APPROVED_DNS_SERVERS = {"10.0.0.53", "10.0.1.53"}

# Known VPN interface name prefixes
VPN_INTERFACE_PREFIXES = ("tun", "wg", "utun", "ppp", "vpn", "ipsec")

# Known VPN process names
VPN_PROCESS_NAMES = (
    "medtrustx-vpn", "openvpn", "wireguard", "strongswan", "openconnect",
    "vpnagentd", "vpnclient", "cisco anyconnect", "globalprotect",
)

# WiFi encryption strength order (higher = better)
WIFI_ENCRYPTION_RANK = {
    "WPA3": 4,
    "WPA2": 3,
    "WPA": 2,
    "WEP": 1,
    "OPEN": 0,
    "NONE": 0,
}


class NetworkSecurityCheck(BaseCheck):
    """Check 08 — Network Security Posture.

    Evaluates the network environment in which the device is operating
    and assigns a trust score based on network type, encryption, and
    DNS configuration.
    """

    CHECK_ID = 8
    CHECK_NAME = "Network Security Posture"
    WEIGHT = 0.08
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
        """Dispatch to platform-specific network check."""
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

    # ── Shared network utilities ───────────────────────────────────────────

    def _get_active_ips(self) -> List[str]:
        """Return list of non-loopback IPv4 addresses for active interfaces."""
        try:
            import netifaces
            ips = []
            for iface in netifaces.interfaces():
                addrs = netifaces.ifaddresses(iface)
                for addr in addrs.get(netifaces.AF_INET, []):
                    ip = addr.get("addr", "")
                    if ip and not ip.startswith("127.") and not ip.startswith("169.254."):
                        ips.append(ip)
            return ips
        except ImportError:
            try:
                result = subprocess.run(
                    ["hostname", "-I"],
                    capture_output=True, text=True, timeout=5,
                )
                return [ip for ip in result.stdout.split() if ip and not ip.startswith("127.")]
            except Exception:
                return []

    def _is_corporate_network(self, ips: List[str]) -> bool:
        """Return True if any active IP falls within the corporate CIDR."""
        from src.config import get_config
        config = get_config()
        try:
            corporate_cidr = ipaddress.ip_network(config.corporate_network_cidr, strict=False)
        except ValueError:
            corporate_cidr = CORPORATE_CIDR
        for ip in ips:
            try:
                if ipaddress.ip_address(ip) in corporate_cidr:
                    return True
            except ValueError:
                continue
        return False

    def _detect_vpn(self) -> Tuple[bool, str]:
        """Detect active VPN connection via interfaces and processes.

        Returns (vpn_active, vpn_name).
        """
        from src.config import get_config
        config = get_config()

        # Check for VPN network interfaces
        try:
            import netifaces
            for iface in netifaces.interfaces():
                for prefix in config.vpn_interface_prefixes:
                    if iface.lower().startswith(prefix):
                        return True, iface
        except ImportError:
            pass

        # Check running processes for VPN agents
        try:
            if sys.platform == "win32":
                result = subprocess.run(
                    ["tasklist", "/FO", "CSV", "/NH"],
                    capture_output=True, text=True, timeout=5,
                )
                procs = result.stdout.lower()
            else:
                result = subprocess.run(
                    ["ps", "aux"],
                    capture_output=True, text=True, timeout=5,
                )
                procs = result.stdout.lower()
            for vpn_name in VPN_PROCESS_NAMES:
                if vpn_name in procs:
                    return True, vpn_name
        except Exception:
            pass

        return False, ""

    def _get_dns_servers(self) -> List[str]:
        """Return list of configured DNS server IP addresses."""
        dns_servers: List[str] = []
        if sys.platform == "win32":
            try:
                result = subprocess.run(
                    [
                        "powershell", "-NoProfile", "-NonInteractive", "-Command",
                        "Get-DnsClientServerAddress -AddressFamily IPv4 | "
                        "Select-Object -ExpandProperty ServerAddresses",
                    ],
                    capture_output=True, text=True, timeout=10,
                )
                for line in result.stdout.splitlines():
                    line = line.strip()
                    if line and re.match(r"^\d+\.\d+\.\d+\.\d+$", line):
                        dns_servers.append(line)
            except Exception:
                pass
        elif sys.platform == "darwin":
            try:
                result = subprocess.run(
                    ["scutil", "--dns"],
                    capture_output=True, text=True, timeout=5,
                )
                for line in result.stdout.splitlines():
                    match = re.search(r"nameserver\[\d+\]\s*:\s*(\d+\.\d+\.\d+\.\d+)", line)
                    if match:
                        dns_servers.append(match.group(1))
            except Exception:
                pass
        else:
            # Linux: parse /etc/resolv.conf
            try:
                resolv = Path("/etc/resolv.conf")
                if resolv.exists():
                    for line in resolv.read_text().splitlines():
                        match = re.match(r"^nameserver\s+(\d+\.\d+\.\d+\.\d+)", line.strip())
                        if match:
                            dns_servers.append(match.group(1))
            except Exception:
                pass
        return list(dict.fromkeys(dns_servers))  # deduplicate preserving order

    def _check_dns_approved(self, dns_servers: List[str]) -> bool:
        """Return True if all DNS servers are in the approved list."""
        from src.config import get_config
        config = get_config()
        approved = set(config.approved_dns_servers)
        if not dns_servers:
            return False
        return all(dns in approved for dns in dns_servers)

    def _check_threat_blocklist(self, ips: List[str]) -> Tuple[bool, List[str]]:
        """Check if any active IPs are in the threat blocklist (iam_db threat_logs).

        Returns (any_blocked, list_of_blocked_ips).
        """
        blocked: List[str] = []
        try:
            from src.config import get_config
            import psycopg2
            config = get_config()
            conn = psycopg2.connect(**config.get_db_connect_kwargs())
            cur = conn.cursor()
            placeholders = ",".join(["%s"] * len(ips))
            cur.execute(
                f"SELECT ip_address FROM threat_logs "
                f"WHERE ip_address IN ({placeholders}) AND active = true "
                f"LIMIT 10",
                ips,
            )
            rows = cur.fetchall()
            blocked = [row[0] for row in rows]
            cur.close()
            conn.close()
        except Exception as exc:
            logger.warning("threat_blocklist_check_failed", error=str(exc))
        return len(blocked) > 0, blocked

    def _score_network(
        self,
        is_corporate: bool,
        vpn_active: bool,
        wifi_encryption: Optional[str],
        dns_approved: bool,
        on_threat_list: bool,
        details: Dict[str, Any],
        recommendations: List[str],
    ) -> float:
        """Compute network score from posture signals."""
        if on_threat_list:
            recommendations.append(
                "Device is connected to a known malicious network. "
                "Disconnect immediately and connect via corporate VPN."
            )
            return 1.0

        enc_rank = WIFI_ENCRYPTION_RANK.get(
            (wifi_encryption or "UNKNOWN").upper(), 3  # default to WPA2-level if wired
        )

        if is_corporate and vpn_active and enc_rank >= 4:
            return 10.0

        if is_corporate and enc_rank >= 3 and dns_approved:
            return 8.0

        if is_corporate and enc_rank >= 3:
            recommendations.append("Connect to approved DNS servers (10.0.0.53, 10.0.1.53).")
            return 7.0

        if vpn_active and not is_corporate:
            recommendations.append("VPN active but not on corporate network.")
            return 6.0

        if not is_corporate and not vpn_active:
            if enc_rank == 0:
                recommendations.append(
                    "Connected to open WiFi with no VPN. "
                    "Connect to MedTrustX VPN immediately."
                )
                return 2.0
            if enc_rank >= 3:
                recommendations.append(
                    "On public WiFi without VPN. "
                    "Connect to MedTrustX VPN before accessing clinical data."
                )
                return 4.0
            recommendations.append("Connect to MedTrustX VPN on this network.")
            return 3.0

        return 5.0

    # ── Windows ────────────────────────────────────────────────────────────

    def _check_windows(self) -> CheckResult:
        """Check Windows network posture via netsh and routing table."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        ips = self._get_active_ips()
        details["active_ips"] = ips
        is_corporate = self._is_corporate_network(ips)
        details["corporate_network"] = is_corporate

        vpn_active, vpn_name = self._detect_vpn()
        details["vpn_active"] = vpn_active
        details["vpn_name"] = vpn_name

        wifi_encryption = self._get_windows_wifi_encryption()
        details["wifi_encryption"] = wifi_encryption

        dns_servers = self._get_dns_servers()
        details["dns_servers"] = dns_servers
        dns_approved = self._check_dns_approved(dns_servers)
        details["dns_approved"] = dns_approved

        on_threat_list, blocked_ips = self._check_threat_blocklist(ips)
        details["on_threat_list"] = on_threat_list
        details["blocked_ips"] = blocked_ips

        score = self._score_network(
            is_corporate, vpn_active, wifi_encryption,
            dns_approved, on_threat_list, details, recommendations
        )
        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations or ["Network posture is acceptable."],
        )

    def _get_windows_wifi_encryption(self) -> Optional[str]:
        """Get WiFi encryption type via netsh wlan show interfaces."""
        try:
            result = subprocess.run(
                ["netsh", "wlan", "show", "interfaces"],
                capture_output=True, text=True, timeout=5,
            )
            output = result.stdout
            auth_match = re.search(r"Authentication\s*:\s*(.+)", output, re.IGNORECASE)
            if auth_match:
                auth = auth_match.group(1).strip()
                if "WPA3" in auth:
                    return "WPA3"
                if "WPA2" in auth:
                    return "WPA2"
                if "WPA" in auth:
                    return "WPA"
                if "Open" in auth or auth.lower() == "open":
                    return "OPEN"
            # If no WiFi interface found, likely wired — consider as WPA2-equivalent
            if "no wireless interface" in output.lower():
                return "WIRED"
        except Exception as exc:
            logger.warning("windows_wifi_check_failed", error=str(exc))
        return None

    # ── macOS ──────────────────────────────────────────────────────────────

    def _check_macos(self) -> CheckResult:
        """Check macOS network posture via airport and scutil."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        ips = self._get_active_ips()
        details["active_ips"] = ips
        is_corporate = self._is_corporate_network(ips)
        details["corporate_network"] = is_corporate

        vpn_active, vpn_name = self._detect_vpn()
        # Also check macOS VPN via scutil
        if not vpn_active:
            vpn_active, vpn_name = self._check_macos_vpn()
        details["vpn_active"] = vpn_active
        details["vpn_name"] = vpn_name

        wifi_encryption = self._get_macos_wifi_encryption()
        details["wifi_encryption"] = wifi_encryption

        dns_servers = self._get_dns_servers()
        details["dns_servers"] = dns_servers
        dns_approved = self._check_dns_approved(dns_servers)
        details["dns_approved"] = dns_approved

        on_threat_list, blocked_ips = self._check_threat_blocklist(ips)
        details["on_threat_list"] = on_threat_list

        score = self._score_network(
            is_corporate, vpn_active, wifi_encryption,
            dns_approved, on_threat_list, details, recommendations
        )
        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations or ["Network posture is acceptable."],
        )

    def _check_macos_vpn(self) -> Tuple[bool, str]:
        """Check macOS VPN connections via scutil."""
        try:
            result = subprocess.run(
                ["scutil", "--nc", "list"],
                capture_output=True, text=True, timeout=5,
            )
            for line in result.stdout.splitlines():
                if "connected" in line.lower():
                    return True, "scutil-vpn"
        except Exception:
            pass
        return False, ""

    def _get_macos_wifi_encryption(self) -> Optional[str]:
        """Get WiFi encryption via airport private framework."""
        airport_paths = [
            "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport",
            "/usr/local/bin/airport",
        ]
        for airport in airport_paths:
            if Path(airport).exists():
                try:
                    result = subprocess.run(
                        [airport, "-I"],
                        capture_output=True, text=True, timeout=5,
                    )
                    output = result.stdout
                    # Look for link authentication
                    link_auth = re.search(r"link auth:\s*(.+)", output, re.IGNORECASE)
                    if link_auth:
                        auth = link_auth.group(1).strip().upper()
                        if "WPA3" in auth:
                            return "WPA3"
                        if "WPA2" in auth:
                            return "WPA2"
                        if "WPA" in auth:
                            return "WPA"
                        if "NONE" in auth:
                            return "OPEN"
                    # Check if running (SSID present) but no auth = wired
                    if "SSID" not in output:
                        return "WIRED"
                except Exception:
                    continue
        return None

    # ── Linux ──────────────────────────────────────────────────────────────

    def _check_linux(self) -> CheckResult:
        """Check Linux network posture via ip and iw commands."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        ips = self._get_active_ips()
        details["active_ips"] = ips
        is_corporate = self._is_corporate_network(ips)
        details["corporate_network"] = is_corporate

        vpn_active, vpn_name = self._detect_vpn()
        details["vpn_active"] = vpn_active
        details["vpn_name"] = vpn_name

        wifi_encryption = self._get_linux_wifi_encryption()
        details["wifi_encryption"] = wifi_encryption

        dns_servers = self._get_dns_servers()
        details["dns_servers"] = dns_servers
        dns_approved = self._check_dns_approved(dns_servers)
        details["dns_approved"] = dns_approved

        on_threat_list, blocked_ips = self._check_threat_blocklist(ips)
        details["on_threat_list"] = on_threat_list

        score = self._score_network(
            is_corporate, vpn_active, wifi_encryption,
            dns_approved, on_threat_list, details, recommendations
        )
        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations or ["Network posture is acceptable."],
        )

    def _get_linux_wifi_encryption(self) -> Optional[str]:
        """Get WiFi encryption via iw or iwconfig on Linux."""
        # Try iw first
        try:
            result = subprocess.run(
                ["iw", "dev"],
                capture_output=True, text=True, timeout=5,
            )
            # Find wifi interface names
            ifaces = re.findall(r"Interface\s+(\S+)", result.stdout)
            for iface in ifaces:
                link_result = subprocess.run(
                    ["iw", "dev", iface, "link"],
                    capture_output=True, text=True, timeout=5,
                )
                output = link_result.stdout
                if "Not connected" in output:
                    continue
                if "RSN" in output or "WPA2" in output:
                    return "WPA2"
                if "WPA3" in output or "SAE" in output:
                    return "WPA3"
                if "WPA" in output:
                    return "WPA"
                if "capability" in output.lower():
                    return "OPEN"
        except FileNotFoundError:
            pass
        except Exception as exc:
            logger.warning("iw_wifi_check_failed", error=str(exc))

        # Try iwconfig fallback
        try:
            result = subprocess.run(
                ["iwconfig"],
                capture_output=True, text=True, timeout=5,
            )
            if "Encryption key:off" in result.stdout:
                return "OPEN"
            if "Encryption key:on" in result.stdout:
                return "WPA2"  # Can't tell WPA version from iwconfig
        except Exception:
            pass

        return "WIRED"  # No WiFi interface found — assume wired

    # ── iOS ────────────────────────────────────────────────────────────────

    def _check_ios(self) -> CheckResult:
        """Check iOS network security posture via MDM and environment."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # iOS network info from MDM/environment
        network_type = os.environ.get("MEDTRUSTX_NETWORK_TYPE", "").lower()
        wifi_security = os.environ.get("MEDTRUSTX_WIFI_SECURITY", "").upper()
        vpn_active = os.environ.get("MEDTRUSTX_VPN_ACTIVE", "").lower() == "true"
        current_ip = os.environ.get("MEDTRUSTX_DEVICE_IP", "")

        details["network_type"] = network_type
        details["wifi_security"] = wifi_security
        details["vpn_active"] = vpn_active
        details["device_ip"] = current_ip

        ips = [current_ip] if current_ip else self._get_active_ips()
        is_corporate = self._is_corporate_network(ips)
        details["corporate_network"] = is_corporate

        # Cellular is always trusted (carrier-managed)
        if network_type == "cellular":
            details["cellular"] = True
            dns_servers = self._get_dns_servers()
            details["dns_servers"] = dns_servers
            return self._make_result(
                score=8.0,
                details=details,
                recommendations=["Connected via cellular — carrier-managed network."],
            )

        dns_servers = self._get_dns_servers()
        details["dns_servers"] = dns_servers
        dns_approved = self._check_dns_approved(dns_servers)

        on_threat_list, _ = self._check_threat_blocklist(ips)

        score = self._score_network(
            is_corporate, vpn_active, wifi_security or None,
            dns_approved, on_threat_list, details, recommendations
        )
        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations or ["iOS network posture is acceptable."],
        )

    # ── Android ────────────────────────────────────────────────────────────

    def _check_android(self) -> CheckResult:
        """Check Android network security via MDM Network Security Config."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        network_type = os.environ.get("MEDTRUSTX_NETWORK_TYPE", "").lower()
        wifi_security = os.environ.get("MEDTRUSTX_WIFI_SECURITY", "").upper()
        vpn_active = os.environ.get("MEDTRUSTX_VPN_ACTIVE", "").lower() == "true"
        current_ip = os.environ.get("MEDTRUSTX_DEVICE_IP", "")
        nsc_compliant = os.environ.get("MEDTRUSTX_NSC_COMPLIANT", "").lower() == "true"

        details["network_type"] = network_type
        details["wifi_security"] = wifi_security
        details["vpn_active"] = vpn_active
        details["nsc_compliant"] = nsc_compliant

        ips = [current_ip] if current_ip else self._get_active_ips()
        is_corporate = self._is_corporate_network(ips)
        details["corporate_network"] = is_corporate

        dns_servers = self._get_dns_servers()
        details["dns_servers"] = dns_servers
        dns_approved = self._check_dns_approved(dns_servers)

        on_threat_list, _ = self._check_threat_blocklist(ips)

        score = self._score_network(
            is_corporate, vpn_active, wifi_security or None,
            dns_approved, on_threat_list, details, recommendations
        )
        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations or ["Android network posture is acceptable."],
        )
