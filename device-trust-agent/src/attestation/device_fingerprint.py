"""
MedTrustX Device Trust Agent — Device Fingerprint Generator.

Generates a hardware-bound device fingerprint using real hardware
identifiers: primary NIC MAC address, CPU ID, OS version string,
system hostname, and agent installation timestamp.

Fingerprint = SHA256(mac_address|cpu_id|os_version|hostname|install_date)

The fingerprint is used in Check 07 (Certificate) to detect hardware
changes or identity drift between registration and current state.
"""

from __future__ import annotations

import hashlib
import os
import platform
import re
import socket
import subprocess
import sys
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

import structlog

logger = structlog.get_logger(__name__)


class DeviceFingerprint:
    """Generates and manages a deterministic hardware-bound device fingerprint.

    The fingerprint is the SHA-256 hex digest of the pipe-joined values of:
      1. Primary NIC MAC address (real hardware, not virtual)
      2. CPU identifier (CPUID / /proc/cpuinfo)
      3. OS version string
      4. System hostname
      5. Agent installation date (from config or env)

    All components are normalised to lowercase stripped strings before hashing
    to ensure stability across minor formatting changes.
    """

    def generate(self) -> str:
        """Compute and return the device fingerprint SHA-256 hex digest.

        Returns:
            64-character lowercase hex SHA-256 digest.
        """
        components = self.get_components()
        raw = "|".join(str(v).lower().strip() for v in components.values())
        fingerprint = hashlib.sha256(raw.encode("utf-8")).hexdigest()
        logger.debug(
            "device_fingerprint_generated",
            fingerprint_prefix=fingerprint[:16],
            component_count=len(components),
        )
        return fingerprint

    def get_components(self) -> Dict[str, str]:
        """Return the ordered dict of fingerprint components and their values.

        Returns:
            OrderedDict with keys: mac_address, cpu_id, os_version,
            hostname, install_date.
        """
        return {
            "mac_address": self._get_mac_address(),
            "cpu_id": self._get_cpu_id(),
            "os_version": self._get_os_version(),
            "hostname": self._get_hostname(),
            "install_date": self._get_install_date(),
        }

    # ── Component collectors ───────────────────────────────────────────────

    def _get_mac_address(self) -> str:
        """Return the MAC address of the primary (non-virtual) NIC.

        Prefers physical Ethernet adapters over WiFi over virtual NICs.
        Falls back to uuid.getnode() which uses the platform MAC address.
        """
        # Try netifaces for reliable multi-platform NIC enumeration
        try:
            import netifaces
            preferred_prefixes = ["eth", "en", "eno", "ens", "enp", "em"]
            interfaces = netifaces.interfaces()
            # Try preferred physical interface names first
            for prefix in preferred_prefixes:
                for iface in interfaces:
                    if iface.lower().startswith(prefix):
                        addrs = netifaces.ifaddresses(iface)
                        mac_entries = addrs.get(netifaces.AF_LINK, [])
                        if mac_entries:
                            mac = mac_entries[0].get("addr", "")
                            if mac and mac != "00:00:00:00:00:00":
                                return mac.lower()
        except ImportError:
            pass

        # Platform-specific fallbacks
        if sys.platform == "win32":
            return self._get_mac_windows()
        if sys.platform == "darwin":
            return self._get_mac_macos()
        if sys.platform.startswith("linux"):
            return self._get_mac_linux()

        # Last resort: uuid.getnode() — uses the platform MAC
        mac_int = uuid.getnode()
        mac_str = ":".join(f"{(mac_int >> (i * 8)) & 0xff:02x}" for i in range(5, -1, -1))
        return mac_str

    def _get_mac_windows(self) -> str:
        """Get primary NIC MAC on Windows via PowerShell."""
        try:
            result = subprocess.run(
                [
                    "powershell", "-NoProfile", "-NonInteractive", "-Command",
                    "Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and "
                    "$_.PhysicalMediaType -ne 'Unspecified' } | "
                    "Sort-Object -Property InterfaceIndex | "
                    "Select-Object -First 1 -ExpandProperty MacAddress",
                ],
                capture_output=True, text=True, timeout=10,
            )
            mac = result.stdout.strip().lower().replace("-", ":")
            if re.match(r"^([0-9a-f]{2}:){5}[0-9a-f]{2}$", mac):
                return mac
        except Exception as exc:
            logger.warning("windows_mac_powershell_failed", error=str(exc))
        return str(uuid.getnode())

    def _get_mac_macos(self) -> str:
        """Get primary NIC MAC on macOS via ifconfig."""
        try:
            result = subprocess.run(
                ["ifconfig", "en0"],
                capture_output=True, text=True, timeout=5,
            )
            match = re.search(r"ether\s+([0-9a-f:]{17})", result.stdout)
            if match:
                return match.group(1).lower()
        except Exception as exc:
            logger.warning("macos_mac_ifconfig_failed", error=str(exc))
        return str(uuid.getnode())

    def _get_mac_linux(self) -> str:
        """Get primary NIC MAC on Linux from /sys/class/net."""
        sys_net = Path("/sys/class/net")
        if sys_net.exists():
            # Filter out loopback and virtual interfaces
            skip_prefixes = ("lo", "docker", "veth", "virbr", "br-", "dummy")
            for iface_path in sorted(sys_net.iterdir()):
                iface = iface_path.name
                if any(iface.startswith(p) for p in skip_prefixes):
                    continue
                mac_file = iface_path / "address"
                if mac_file.exists():
                    mac = mac_file.read_text().strip().lower()
                    if mac and mac != "00:00:00:00:00:00":
                        return mac
        return str(uuid.getnode())

    def _get_cpu_id(self) -> str:
        """Return a stable CPU identifier for the host CPU.

        Uses CPUID vendor + model string on x86, or /proc/cpuinfo on Linux,
        or system_profiler on macOS, or WMIC on Windows.
        """
        if sys.platform.startswith("linux"):
            return self._get_cpu_id_linux()
        if sys.platform == "darwin":
            return self._get_cpu_id_macos()
        if sys.platform == "win32":
            return self._get_cpu_id_windows()
        # Fallback: use platform.processor() which often returns useful info
        return platform.processor() or platform.machine()

    def _get_cpu_id_linux(self) -> str:
        """Parse CPU ID from /proc/cpuinfo."""
        try:
            cpuinfo = Path("/proc/cpuinfo").read_text()
            # Look for processor serial number (rare but definitive)
            serial_match = re.search(r"Serial\s*:\s*(\S+)", cpuinfo, re.IGNORECASE)
            if serial_match:
                return serial_match.group(1).lower()
            # Use model name + cpu MHz combination as stable proxy
            model_match = re.search(r"model name\s*:\s*(.+)", cpuinfo, re.IGNORECASE)
            if model_match:
                model = model_match.group(1).strip()
                # Include physical ID for multi-socket disambiguation
                phys_match = re.search(r"physical id\s*:\s*(\d+)", cpuinfo)
                phys_id = phys_match.group(1) if phys_match else "0"
                return f"{model}:{phys_id}".lower()
        except Exception as exc:
            logger.warning("linux_cpuinfo_failed", error=str(exc))
        return platform.processor()

    def _get_cpu_id_macos(self) -> str:
        """Get CPU model identifier on macOS via sysctl."""
        try:
            result = subprocess.run(
                ["sysctl", "-n", "machdep.cpu.brand_string"],
                capture_output=True, text=True, timeout=5,
            )
            brand = result.stdout.strip().lower()
            if brand:
                return brand
        except Exception as exc:
            logger.warning("macos_sysctl_cpu_failed", error=str(exc))
        return platform.processor()

    def _get_cpu_id_windows(self) -> str:
        """Get CPU processor ID on Windows via WMIC or PowerShell."""
        try:
            result = subprocess.run(
                [
                    "powershell", "-NoProfile", "-NonInteractive", "-Command",
                    "Get-WmiObject Win32_Processor | "
                    "Select-Object -First 1 -ExpandProperty ProcessorId",
                ],
                capture_output=True, text=True, timeout=10,
            )
            cpu_id = result.stdout.strip().lower()
            if cpu_id:
                return cpu_id
        except Exception as exc:
            logger.warning("windows_cpu_id_failed", error=str(exc))
        return platform.processor()

    def _get_os_version(self) -> str:
        """Return the exact OS version string for this platform."""
        if sys.platform == "win32":
            try:
                import winreg  # type: ignore[import]
                key = winreg.OpenKey(
                    winreg.HKEY_LOCAL_MACHINE,
                    r"SOFTWARE\Microsoft\Windows NT\CurrentVersion",
                )
                build = winreg.QueryValueEx(key, "CurrentBuild")[0]
                ubr = winreg.QueryValueEx(key, "UBR")[0]
                display_ver = winreg.QueryValueEx(key, "DisplayVersion")[0]
                winreg.CloseKey(key)
                return f"windows-{display_ver}-{build}.{ubr}".lower()
            except Exception:
                return platform.version().lower()
        if sys.platform == "darwin":
            try:
                result = subprocess.run(
                    ["sw_vers", "-productVersion"],
                    capture_output=True, text=True, timeout=5,
                )
                return f"macos-{result.stdout.strip()}".lower()
            except Exception:
                return platform.mac_ver()[0].lower()
        if sys.platform.startswith("linux"):
            try:
                with open("/etc/os-release") as f:
                    info: Dict[str, str] = {}
                    for line in f:
                        if "=" in line:
                            k, _, v = line.strip().partition("=")
                            info[k] = v.strip('"')
                return f"linux-{info.get('ID', 'linux')}-{info.get('VERSION_ID', '')}".lower()
            except Exception:
                pass
        return os.environ.get("MEDTRUSTX_OS_VERSION", platform.version()).lower()

    def _get_hostname(self) -> str:
        """Return the system hostname (FQDN preferred)."""
        try:
            return socket.getfqdn().lower()
        except Exception:
            return socket.gethostname().lower()

    def _get_install_date(self) -> str:
        """Return the agent installation date from config or environment.

        Falls back to a deterministic placeholder if not yet recorded.
        The install date is set once during first registration and stored
        in .env as DEVICE_INSTALL_DATE.
        """
        # From config
        install_date = os.environ.get("DEVICE_INSTALL_DATE", "").strip()
        if install_date:
            return install_date

        # From config module
        try:
            from src.config import get_config
            config = get_config()
            if config.device_install_date:
                return config.device_install_date
        except Exception:
            pass

        # If not yet set, use a placeholder that is stable per-boot
        # (agent will store the real value after first successful registration)
        return "unregistered"
