"""
MedTrustX Device Trust Agent — Platform Detection Module.

Provides a singleton PlatformInfo object that identifies the current
operating system, version, architecture, and runtime context. Used by
all check modules to gate platform-specific code paths and by the
TrustReport to populate the platform field.

Supported platforms: Windows, macOS, Linux, iOS, Android.
iOS and Android are detected from environment variables injected by
the MDM wrapper that hosts the agent on mobile devices.
"""

from __future__ import annotations

import os
import platform
import re
import socket
import struct
import subprocess
import sys
from dataclasses import dataclass, field
from enum import Enum
from functools import lru_cache
from typing import Optional

import structlog

logger = structlog.get_logger(__name__)


class Platform(str, Enum):
    """Enumeration of all supported operating system platforms."""

    WINDOWS = "Windows"
    MACOS = "macOS"
    LINUX = "Linux"
    IOS = "iOS"
    ANDROID = "Android"
    UNKNOWN = "Unknown"


@dataclass(frozen=True)
class PlatformInfo:
    """Immutable platform descriptor populated once at agent startup."""

    platform: Platform
    os_name: str
    os_version: str
    os_build: str
    kernel_version: str
    architecture: str
    hostname: str
    is_virtual_machine: bool
    is_container: bool
    python_version: str
    agent_uid: int
    agent_is_root: bool
    # Mobile-specific fields (populated from MDM environment when applicable)
    mdm_enrolled: bool = False
    mdm_device_id: str = ""

    @property
    def is_windows(self) -> bool:
        return self.platform == Platform.WINDOWS

    @property
    def is_macos(self) -> bool:
        return self.platform == Platform.MACOS

    @property
    def is_linux(self) -> bool:
        return self.platform == Platform.LINUX

    @property
    def is_ios(self) -> bool:
        return self.platform == Platform.IOS

    @property
    def is_android(self) -> bool:
        return self.platform == Platform.ANDROID

    @property
    def is_mobile(self) -> bool:
        return self.platform in (Platform.IOS, Platform.ANDROID)

    @property
    def is_desktop(self) -> bool:
        return self.platform in (Platform.WINDOWS, Platform.MACOS, Platform.LINUX)


def _detect_platform() -> Platform:
    """Determine the current platform from sys.platform and environment."""
    # Mobile detection via environment variable injected by MDM wrapper
    mdm_platform = os.environ.get("MEDTRUSTX_MOBILE_PLATFORM", "").lower()
    if mdm_platform == "ios":
        return Platform.IOS
    if mdm_platform == "android":
        return Platform.ANDROID

    system = sys.platform
    if system == "win32":
        return Platform.WINDOWS
    if system == "darwin":
        return Platform.MACOS
    if system.startswith("linux"):
        return Platform.LINUX
    return Platform.UNKNOWN


def _get_windows_build_info() -> tuple[str, str, str]:
    """Return (os_version, os_build, kernel_version) on Windows."""
    try:
        import winreg  # type: ignore[import]

        key = winreg.OpenKey(
            winreg.HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Microsoft\Windows NT\CurrentVersion",
        )
        display_version = winreg.QueryValueEx(key, "DisplayVersion")[0]
        current_build = winreg.QueryValueEx(key, "CurrentBuild")[0]
        ubr = winreg.QueryValueEx(key, "UBR")[0]
        winreg.CloseKey(key)
        os_version = f"Windows {display_version}"
        os_build = f"{current_build}.{ubr}"
        kernel_version = platform.version()
        return os_version, os_build, kernel_version
    except Exception as exc:
        logger.warning("windows_build_info_failed", error=str(exc))
        ver = platform.version()
        return f"Windows {ver}", ver, ver


def _get_macos_version_info() -> tuple[str, str, str]:
    """Return (os_version, os_build, kernel_version) on macOS."""
    try:
        result = subprocess.run(
            ["sw_vers", "-productVersion"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        os_version = result.stdout.strip()
        build_result = subprocess.run(
            ["sw_vers", "-buildVersion"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        os_build = build_result.stdout.strip()
        kernel_result = subprocess.run(
            ["uname", "-r"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        kernel_version = kernel_result.stdout.strip()
        return os_version, os_build, kernel_version
    except Exception as exc:
        logger.warning("macos_version_info_failed", error=str(exc))
        ver = platform.mac_ver()[0]
        return ver, "", platform.release()


def _get_linux_version_info() -> tuple[str, str, str]:
    """Return (os_version, os_build, kernel_version) on Linux."""
    os_version = ""
    os_build = ""

    # Try /etc/os-release for distribution info
    try:
        with open("/etc/os-release") as f:
            info: dict[str, str] = {}
            for line in f:
                line = line.strip()
                if "=" in line:
                    k, _, v = line.partition("=")
                    info[k] = v.strip('"')
        os_version = f"{info.get('NAME', 'Linux')} {info.get('VERSION_ID', '')}"
        os_build = info.get("BUILD_ID", info.get("VERSION", ""))
    except Exception:
        os_version = platform.linux_distribution()[0] if hasattr(platform, "linux_distribution") else "Linux"  # type: ignore[attr-defined]

    # Kernel version from uname
    try:
        kernel_result = subprocess.run(
            ["uname", "-r"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        kernel_version = kernel_result.stdout.strip()
    except Exception:
        kernel_version = platform.release()

    return os_version, os_build, kernel_version


def _detect_virtual_machine() -> bool:
    """Best-effort detection of whether we are running inside a VM."""
    try:
        if sys.platform == "linux":
            # Check DMI/SMBIOS vendor string
            dmi_paths = [
                "/sys/class/dmi/id/product_name",
                "/sys/class/dmi/id/sys_vendor",
                "/sys/class/dmi/id/board_vendor",
            ]
            vm_indicators = {
                "vmware", "virtualbox", "qemu", "kvm", "xen", "hyper-v",
                "microsoft corporation", "bochs", "parallels", "vbox",
            }
            for path in dmi_paths:
                try:
                    with open(path) as f:
                        val = f.read().lower()
                    if any(ind in val for ind in vm_indicators):
                        return True
                except OSError:
                    continue
        elif sys.platform == "win32":
            import subprocess as sp
            result = sp.run(
                ["wmic", "computersystem", "get", "model"],
                capture_output=True, text=True, timeout=5,
            )
            model = result.stdout.lower()
            return any(v in model for v in ("vmware", "virtualbox", "virtual machine"))
        elif sys.platform == "darwin":
            result = subprocess.run(
                ["system_profiler", "SPHardwareDataType"],
                capture_output=True, text=True, timeout=10,
            )
            output = result.stdout.lower()
            return "vmware" in output or "virtualbox" in output
    except Exception:
        pass
    return False


def _detect_container() -> bool:
    """Detect if the agent is running inside a container (Docker/LXC)."""
    # cgroup v1 indicator
    try:
        with open("/proc/1/cgroup") as f:
            content = f.read()
        if "docker" in content or "kubepods" in content or "lxc" in content:
            return True
    except OSError:
        pass
    # /.dockerenv file existence
    if os.path.exists("/.dockerenv"):
        return True
    return False


@lru_cache(maxsize=1)
def detect_platform() -> PlatformInfo:
    """Detect and return immutable PlatformInfo for the current host.

    Result is cached indefinitely — platform does not change at runtime.
    """
    current_platform = _detect_platform()
    hostname = socket.gethostname()
    arch = platform.machine()
    py_version = platform.python_version()
    uid = os.getuid() if hasattr(os, "getuid") else 0
    is_root = uid == 0

    # Platform-specific version detection
    if current_platform == Platform.WINDOWS:
        os_name = "Windows"
        os_version, os_build, kernel_version = _get_windows_build_info()
    elif current_platform == Platform.MACOS:
        os_name = "macOS"
        os_version, os_build, kernel_version = _get_macos_version_info()
    elif current_platform == Platform.LINUX:
        os_name = "Linux"
        os_version, os_build, kernel_version = _get_linux_version_info()
    elif current_platform == Platform.IOS:
        os_name = "iOS"
        os_version = os.environ.get("MEDTRUSTX_OS_VERSION", "unknown")
        os_build = os.environ.get("MEDTRUSTX_OS_BUILD", "")
        kernel_version = ""
    elif current_platform == Platform.ANDROID:
        os_name = "Android"
        os_version = os.environ.get("MEDTRUSTX_OS_VERSION", "unknown")
        os_build = os.environ.get("MEDTRUSTX_OS_BUILD", "")
        kernel_version = ""
    else:
        os_name = "Unknown"
        os_version = platform.version()
        os_build = ""
        kernel_version = platform.release()

    # Container and VM detection only meaningful on Linux
    is_vm = _detect_virtual_machine() if current_platform in (
        Platform.LINUX, Platform.WINDOWS, Platform.MACOS
    ) else False
    is_container = _detect_container() if current_platform == Platform.LINUX else False

    # MDM enrollment for mobile
    mdm_enrolled = os.environ.get("MEDTRUSTX_MDM_ENROLLED", "").lower() == "true"
    mdm_device_id = os.environ.get("MEDTRUSTX_MDM_DEVICE_ID", "")

    info = PlatformInfo(
        platform=current_platform,
        os_name=os_name,
        os_version=os_version,
        os_build=os_build,
        kernel_version=kernel_version,
        architecture=arch,
        hostname=hostname,
        is_virtual_machine=is_vm,
        is_container=is_container,
        python_version=py_version,
        agent_uid=uid,
        agent_is_root=is_root,
        mdm_enrolled=mdm_enrolled,
        mdm_device_id=mdm_device_id,
    )

    logger.info(
        "platform_detected",
        platform=info.platform.value,
        os_version=info.os_version,
        os_build=info.os_build,
        kernel=info.kernel_version,
        arch=info.architecture,
        is_vm=info.is_virtual_machine,
        is_container=info.is_container,
        is_root=info.agent_is_root,
    )

    return info
