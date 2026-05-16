"""
MedTrustX Device Trust Agent — Check 03: Disk Encryption Status (weight: 10%).

Verifies full-disk encryption is active on the device. Distinguishes
hardware-backed encryption (highest score) from software encryption
from partial/no encryption.

Scoring:
  10 — full disk encrypted, hardware-backed keys
   7 — full disk encrypted, software keys
   4 — partial encryption (only home dir or user partition)
   1 — no encryption detected
"""

from __future__ import annotations

import asyncio
import os
import re
import subprocess
from pathlib import Path
from typing import Any, Dict, List, Optional

import structlog

from src.checks.base_check import BaseCheck
from src.models.check_result import CheckResult
from src.platform_detector import Platform

logger = structlog.get_logger(__name__)


class DiskEncryptionCheck(BaseCheck):
    """Check 03 — Disk Encryption Status.

    Verifies whether full-disk encryption is active and evaluates
    whether keys are hardware-backed (TPM/Secure Enclave) or software.
    """

    CHECK_ID = 3
    CHECK_NAME = "Disk Encryption"
    WEIGHT = 0.10
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
        """Dispatch to platform-specific encryption check."""
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
        """Check BitLocker encryption status for all drives."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # manage-bde status for C: drive
        c_drive_status = self._get_bitlocker_status("C:")
        details["c_drive"] = c_drive_status

        # Check all fixed drives
        all_drives = self._get_all_windows_drives()
        drive_statuses: Dict[str, Any] = {}
        all_encrypted = True
        any_hardware_backed = False

        for drive in all_drives:
            status = self._get_bitlocker_status(drive)
            drive_statuses[drive] = status
            if not status.get("encrypted", False):
                all_encrypted = False
            if status.get("hardware_backed", False):
                any_hardware_backed = True

        details["all_drives"] = drive_statuses
        details["all_drives_encrypted"] = all_encrypted
        details["any_hardware_backed"] = any_hardware_backed

        # Also verify via WMI Win32_EncryptableVolume
        wmi_status = self._check_wmi_encryptable_volumes()
        details["wmi_encryptable_volumes"] = wmi_status

        if not c_drive_status.get("encrypted", False):
            recommendations.append(
                "BitLocker is not enabled on drive C:. "
                "Enable BitLocker: Control Panel → BitLocker Drive Encryption. "
                "Requires TPM 2.0 for hardware key protection."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        if not all_encrypted:
            recommendations.append(
                "Some drives are not BitLocker-encrypted. "
                "Enable BitLocker on all fixed drives."
            )
            score = 4.0
        elif any_hardware_backed:
            score = 10.0
            recommendations.append("All drives are BitLocker-encrypted with TPM (hardware-backed).")
        else:
            score = 7.0
            recommendations.append(
                "All drives are BitLocker-encrypted (software keys). "
                "Consider enabling TPM-backed encryption for stronger protection."
            )

        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations,
        )

    def _get_bitlocker_status(self, drive: str) -> Dict[str, Any]:
        """Run manage-bde -status for a specific drive letter."""
        try:
            result = subprocess.run(
                ["manage-bde", "-status", drive],
                capture_output=True, text=True, timeout=10,
            )
            output = result.stdout + result.stderr
            encrypted = "Protection On" in output or "Fully Encrypted" in output
            hardware_backed = "TPM" in output or "Hardware Test" in output

            # Parse encryption method
            method_match = re.search(r"Encryption Method:\s+(.+)", output)
            encryption_method = method_match.group(1).strip() if method_match else "Unknown"

            # Parse protection status
            status_match = re.search(r"Protection Status:\s+(.+)", output)
            protection_status = status_match.group(1).strip() if status_match else "Unknown"

            return {
                "drive": drive,
                "encrypted": encrypted,
                "hardware_backed": hardware_backed,
                "encryption_method": encryption_method,
                "protection_status": protection_status,
            }
        except FileNotFoundError:
            # manage-bde not available — try PowerShell
            return self._get_bitlocker_status_powershell(drive)
        except Exception as exc:
            logger.warning("manage_bde_failed", drive=drive, error=str(exc))
            return {"drive": drive, "encrypted": False, "error": str(exc)}

    def _get_bitlocker_status_powershell(self, drive: str) -> Dict[str, Any]:
        """Fallback: get BitLocker status via PowerShell."""
        try:
            result = subprocess.run(
                [
                    "powershell", "-NoProfile", "-NonInteractive", "-Command",
                    f"Get-BitLockerVolume -MountPoint '{drive}' | "
                    "Select-Object MountPoint, EncryptionPercentage, VolumeStatus, "
                    "ProtectionStatus, KeyProtector | ConvertTo-Json"
                ],
                capture_output=True, text=True, timeout=10,
            )
            import json
            data = json.loads(result.stdout.strip())
            encrypted = data.get("EncryptionPercentage", 0) == 100
            # ProtectionStatus: 0=Off, 1=On, 2=Unknown
            protection_on = data.get("ProtectionStatus", 0) == 1
            # Check for TPM key protector
            key_protectors = data.get("KeyProtector", [])
            hardware_backed = any(
                kp.get("KeyProtectorType") in ("Tpm", "TpmPin", "TpmNetworkKey")
                for kp in (key_protectors if isinstance(key_protectors, list) else [key_protectors])
            )
            return {
                "drive": drive,
                "encrypted": encrypted and protection_on,
                "hardware_backed": hardware_backed,
                "encryption_percentage": data.get("EncryptionPercentage", 0),
                "volume_status": data.get("VolumeStatus", "Unknown"),
            }
        except Exception as exc:
            logger.warning("bitlocker_powershell_failed", drive=drive, error=str(exc))
            return {"drive": drive, "encrypted": False, "error": str(exc)}

    def _get_all_windows_drives(self) -> List[str]:
        """Return list of fixed drive letters (e.g. ['C:', 'D:'])."""
        try:
            result = subprocess.run(
                [
                    "powershell", "-NoProfile", "-NonInteractive", "-Command",
                    "Get-PSDrive -PSProvider FileSystem | "
                    "Where-Object {$_.Root -match '^[A-Z]:\\\\'} | "
                    "Select-Object -ExpandProperty Root"
                ],
                capture_output=True, text=True, timeout=10,
            )
            drives = []
            for line in result.stdout.splitlines():
                line = line.strip().rstrip("\\")
                if re.match(r"^[A-Z]:$", line):
                    drives.append(line)
            return drives if drives else ["C:"]
        except Exception:
            return ["C:"]

    def _check_wmi_encryptable_volumes(self) -> List[Dict[str, Any]]:
        """Query WMI Win32_EncryptableVolume for encryption status."""
        volumes = []
        try:
            import wmi  # type: ignore[import]
            c = wmi.WMI(namespace="root\\CIMv2\\Security\\MicrosoftVolumeEncryption")
            for vol in c.Win32_EncryptableVolume():
                # ConversionStatus: 0=FullyDecrypted, 1=FullyEncrypted, 2=EncryptionInProgress, etc.
                volumes.append({
                    "drive": getattr(vol, "DriveLetter", "?"),
                    "conversion_status": getattr(vol, "ConversionStatus", -1),
                    "protection_status": getattr(vol, "ProtectionStatus", -1),
                    "encryption_method": getattr(vol, "EncryptionMethod", -1),
                })
        except Exception as exc:
            logger.warning("wmi_encryptable_volume_query_failed", error=str(exc))
        return volumes

    # ── macOS ──────────────────────────────────────────────────────────────

    def _check_macos(self) -> CheckResult:
        """Check FileVault 2 encryption status."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        try:
            result = subprocess.run(
                ["fdesetup", "status"],
                capture_output=True, text=True, timeout=10,
            )
            output = result.stdout.strip()
            details["fdesetup_output"] = output

            file_vault_on = "FileVault is On" in output
            details["filevault_enabled"] = file_vault_on

            if not file_vault_on:
                recommendations.append(
                    "FileVault 2 is not enabled. "
                    "Enable via: System Settings → Privacy & Security → FileVault. "
                    "Requires admin credentials and system restart."
                )
                return self._make_result(
                    score=1.0,
                    details=details,
                    recommendations=recommendations,
                )

            # Check recovery key escrow
            escrow_result = subprocess.run(
                ["fdesetup", "showrecovery", "-device"],
                capture_output=True, text=True, timeout=5,
            )
            # If escrow is configured with MDM, it indicates institutional key backup
            escrow_active = escrow_result.returncode == 0 and bool(escrow_result.stdout.strip())
            details["recovery_key_escrowed"] = escrow_active

            # macOS FileVault on Apple Silicon uses hardware Secure Enclave
            is_apple_silicon = self._platform_info.architecture in ("arm64", "arm")
            details["is_apple_silicon"] = is_apple_silicon

            if is_apple_silicon:
                # Apple Silicon has hardware-backed encryption via Secure Enclave
                score = 10.0
                recommendations.append(
                    "FileVault is enabled with hardware-backed Secure Enclave encryption."
                )
            else:
                # Intel Mac uses software AES-XTS — still full encryption
                score = 7.0
                recommendations.append(
                    "FileVault is enabled (software AES-XTS encryption). "
                    "Consider upgrading to Apple Silicon for hardware-backed encryption."
                )

        except FileNotFoundError:
            return self._make_result(
                score=1.0,
                details={"error": "fdesetup not found"},
                recommendations=["fdesetup tool not found. Cannot verify FileVault status."],
            )
        except Exception as exc:
            return self._make_result(
                score=1.0,
                details={"error": str(exc)},
                recommendations=["Unable to check FileVault status."],
            )

        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations,
        )

    # ── Linux ──────────────────────────────────────────────────────────────

    def _check_linux(self) -> CheckResult:
        """Check LUKS/dm-crypt encryption via lsblk and dmsetup."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # Get block device list with filesystem info
        block_devices = self._get_linux_block_devices()
        details["block_devices"] = block_devices

        # Count device types
        crypt_devices = [d for d in block_devices if d.get("type") == "crypt"]
        disk_devices = [d for d in block_devices if d.get("type") == "disk"]
        part_devices = [d for d in block_devices if d.get("type") == "part"]
        details["crypt_device_count"] = len(crypt_devices)
        details["disk_count"] = len(disk_devices)

        # Check /etc/crypttab for persistent encryption config
        crypttab_entries = self._read_crypttab()
        details["crypttab_entries"] = crypttab_entries

        # Check dmsetup for active crypto mappings
        dmsetup_status = self._check_dmsetup()
        details["dmsetup_mappings"] = dmsetup_status

        # Check if root filesystem is on an encrypted device
        root_encrypted = self._is_root_encrypted(block_devices)
        details["root_encrypted"] = root_encrypted

        # Check home directory encryption as fallback
        home_encrypted = self._is_home_encrypted()
        details["home_encrypted"] = home_encrypted

        if not crypt_devices and not dmsetup_status:
            recommendations.append(
                "No LUKS/dm-crypt encryption detected. "
                "Enable full-disk encryption during OS installation or use: "
                "cryptsetup luksFormat /dev/<disk>"
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )

        if root_encrypted:
            # Full disk encryption with LUKS — hardware TPM backing if available
            tpm_available = self._check_tpm_available()
            details["tpm_available"] = tpm_available
            if tpm_available:
                score = 10.0
                recommendations.append(
                    "Root filesystem is LUKS-encrypted with TPM-backed key sealing."
                )
            else:
                score = 7.0
                recommendations.append(
                    "Root filesystem is LUKS-encrypted. "
                    "Consider binding LUKS key to TPM for hardware-backed protection."
                )
        elif home_encrypted:
            score = 4.0
            recommendations.append(
                "Only the home directory appears encrypted. "
                "Enable full-disk LUKS encryption for complete protection."
            )
        else:
            score = 4.0
            recommendations.append(
                "Partial encryption detected. "
                "Ensure the root filesystem is on a LUKS-encrypted device."
            )

        return self._make_result(
            score=score,
            details=details,
            recommendations=recommendations,
        )

    def _get_linux_block_devices(self) -> List[Dict[str, Any]]:
        """Return list of block devices with type, mount, and filesystem info."""
        try:
            result = subprocess.run(
                ["lsblk", "-o", "NAME,TYPE,MOUNTPOINT,FSTYPE,SIZE", "--json"],
                capture_output=True, text=True, timeout=10,
            )
            import json
            data = json.loads(result.stdout)
            devices = []

            def flatten(device: Dict, parent: str = "") -> None:
                devices.append({
                    "name": device.get("name", ""),
                    "type": device.get("type", ""),
                    "mountpoint": device.get("mountpoint") or "",
                    "fstype": device.get("fstype") or "",
                    "size": device.get("size", ""),
                })
                for child in device.get("children", []):
                    flatten(child, device.get("name", ""))

            for dev in data.get("blockdevices", []):
                flatten(dev)
            return devices
        except Exception as exc:
            logger.warning("lsblk_failed", error=str(exc))
            return []

    def _read_crypttab(self) -> List[str]:
        """Read /etc/crypttab entries (persistent encrypted device mappings)."""
        crypttab = Path("/etc/crypttab")
        if not crypttab.exists():
            return []
        try:
            lines = []
            for line in crypttab.read_text().splitlines():
                line = line.strip()
                if line and not line.startswith("#"):
                    lines.append(line)
            return lines
        except Exception:
            return []

    def _check_dmsetup(self) -> List[str]:
        """Return list of active dm-crypt device mapper mappings."""
        try:
            result = subprocess.run(
                ["dmsetup", "status"],
                capture_output=True, text=True, timeout=5,
            )
            mappings = []
            for line in result.stdout.splitlines():
                if "crypt" in line.lower() or "No devices found" not in line:
                    mappings.append(line.strip())
            return mappings
        except Exception as exc:
            logger.warning("dmsetup_failed", error=str(exc))
            return []

    def _is_root_encrypted(self, block_devices: List[Dict[str, Any]]) -> bool:
        """Check if root filesystem (/) is on an encrypted device."""
        for device in block_devices:
            if device.get("mountpoint") == "/" and device.get("type") == "crypt":
                return True
        # Check if root's parent chain includes a crypt layer
        root_device = next(
            (d for d in block_devices if d.get("mountpoint") == "/"), None
        )
        if root_device:
            # If /proc/mounts shows dm-X as root device, check if it's a crypt device
            try:
                with open("/proc/mounts") as f:
                    for line in f:
                        parts = line.split()
                        if len(parts) >= 2 and parts[1] == "/":
                            device_name = Path(parts[0]).name
                            # Check if dm device is crypt
                            dm_path = Path(f"/sys/block/{device_name}/dm/uuid")
                            if dm_path.exists():
                                uuid_str = dm_path.read_text().strip()
                                if uuid_str.startswith("CRYPT-"):
                                    return True
            except Exception:
                pass
        return False

    def _is_home_encrypted(self) -> bool:
        """Detect if home directory uses ecryptfs or is on a separate LUKS partition."""
        # Check for ecryptfs
        try:
            result = subprocess.run(
                ["mount"],
                capture_output=True, text=True, timeout=5,
            )
            if "ecryptfs" in result.stdout:
                return True
        except Exception:
            pass
        # Check if /home is a separate crypt device
        try:
            result = subprocess.run(
                ["findmnt", "-n", "-o", "FSTYPE", "/home"],
                capture_output=True, text=True, timeout=5,
            )
            return "crypt" in result.stdout.lower() or "luks" in result.stdout.lower()
        except Exception:
            pass
        return False

    def _check_tpm_available(self) -> bool:
        """Check if a TPM device is available on the system."""
        tpm_paths = ["/dev/tpm0", "/dev/tpmrm0", "/sys/class/tpm/tpm0"]
        return any(Path(p).exists() for p in tpm_paths)

    # ── iOS ────────────────────────────────────────────────────────────────

    def _check_ios(self) -> CheckResult:
        """Check iOS hardware encryption and passcode requirement."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # iOS uses hardware AES-256 encryption always enabled for data protection
        # The security class depends on passcode being set
        passcode_set = os.environ.get("MEDTRUSTX_PASSCODE_SET", "").lower() == "true"
        data_protection_class = os.environ.get("MEDTRUSTX_DATA_PROTECTION_CLASS", "")

        details["passcode_set"] = passcode_set
        details["data_protection_class"] = data_protection_class
        details["hardware_encryption"] = True  # Always true on iOS

        if not passcode_set:
            recommendations.append(
                "iOS passcode is not set. Hardware encryption keys are not fully protected. "
                "Set a passcode via Settings → Face ID & Passcode."
            )
            return self._make_result(
                score=4.0,  # Encryption hardware exists but passcode gate not set
                details=details,
                recommendations=recommendations,
            )

        # With passcode set, iOS data protection is hardware-backed
        return self._make_result(
            score=10.0,
            details=details,
            recommendations=["iOS hardware encryption is active with passcode protection."],
        )

    # ── Android ────────────────────────────────────────────────────────────

    def _check_android(self) -> CheckResult:
        """Check Android device encryption status via MDM DevicePolicyManager."""
        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        encryption_status = os.environ.get("MEDTRUSTX_ENCRYPTION_STATUS", "").lower()
        details["encryption_status"] = encryption_status

        # DevicePolicyManager encryption status values
        # ENCRYPTION_STATUS_UNSUPPORTED = 0
        # ENCRYPTION_STATUS_INACTIVE = 1
        # ENCRYPTION_STATUS_ACTIVATING = 2
        # ENCRYPTION_STATUS_ACTIVE = 3
        # ENCRYPTION_STATUS_ACTIVE_DEFAULT_KEY = 4
        # ENCRYPTION_STATUS_ACTIVE_PER_USER = 5
        encryption_status_map = {
            "unsupported": 0,
            "inactive": 1,
            "activating": 2,
            "active": 3,
            "active_default_key": 4,
            "active_per_user": 5,
        }
        status_value = encryption_status_map.get(encryption_status, -1)
        details["encryption_status_value"] = status_value

        if status_value in (3, 5):  # ACTIVE or ACTIVE_PER_USER
            # Check if hardware-backed (Android 7+ uses file-based encryption)
            android_version_str = self._platform_info.os_version
            try:
                major = int(android_version_str.split(".")[0])
                hardware_backed = major >= 10  # Android 10+ uses hardware-backed FBE
            except (ValueError, IndexError):
                hardware_backed = False
            details["hardware_backed"] = hardware_backed
            score = 10.0 if hardware_backed else 7.0
            return self._make_result(
                score=score,
                details=details,
                recommendations=[
                    "Android device encryption is active." +
                    (" (hardware-backed FBE)" if hardware_backed else " (software)")
                ],
            )
        elif status_value == 4:  # ACTIVE_DEFAULT_KEY — full disk but weaker
            return self._make_result(
                score=7.0,
                details=details,
                recommendations=["Android encryption active with default key. "
                                  "Set a screen lock PIN for stronger key derivation."],
            )
        elif status_value in (1, 2):  # INACTIVE or ACTIVATING
            recommendations.append(
                "Android encryption is not active. "
                "Enable encryption via Settings → Security → Encrypt Device."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )
        else:
            recommendations.append(
                "Android encryption status unknown. "
                "Verify MDM policy enforcement for encryption."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
            )
