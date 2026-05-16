"""
MedTrustX Device Trust Agent — Certificate Manager.

Handles loading, caching, validating, and refreshing the device
certificate from the platform-specific certificate store. Provides
the device private key for signing attestation payloads, and exposes
the OCSP check as a standalone utility for Check 07.
"""

from __future__ import annotations

import os
import subprocess
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import structlog

logger = structlog.get_logger(__name__)


class CertificateManager:
    """Manages the device certificate lifecycle for the trust agent.

    Thread-safe via an internal lock. The certificate and private key
    are cached in memory after the first successful load and re-validated
    on each access.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._cert_pem: Optional[bytes] = None
        self._key_pem: Optional[bytes] = None
        self._cert_info: Optional[Dict[str, Any]] = None
        self._loaded_at: Optional[datetime] = None

    def get_device_certificate(self) -> Optional[bytes]:
        """Return the device certificate PEM bytes.

        Loads from the filesystem on first call; returns cached value
        on subsequent calls. Returns None if certificate is not available.
        """
        with self._lock:
            if self._cert_pem is None:
                self._cert_pem, error = self._load_certificate()
                if error:
                    logger.warning("cert_load_failed", error=error)
                    return None
                self._loaded_at = datetime.now(timezone.utc)
            return self._cert_pem

    def get_device_private_key(self) -> Optional[bytes]:
        """Return the device private key PEM bytes.

        Returns None if the key file is not available or readable.
        """
        with self._lock:
            if self._key_pem is None:
                self._key_pem, error = self._load_private_key()
                if error:
                    logger.warning("key_load_failed", error=error)
                    return None
            return self._key_pem

    def get_cert_info(self) -> Dict[str, Any]:
        """Return parsed certificate metadata dict.

        Returns an empty dict if certificate is not available.
        """
        with self._lock:
            if self._cert_info is None and self._cert_pem:
                self._cert_info = self._parse_cert_info(self._cert_pem)
            return self._cert_info or {}

    def is_cert_valid(self) -> bool:
        """Return True if the certificate is loaded and not expired."""
        cert_pem = self.get_device_certificate()
        if not cert_pem:
            return False
        info = self.get_cert_info()
        not_after = info.get("not_after")
        if not not_after:
            return False
        try:
            expiry = datetime.fromisoformat(not_after)
            if expiry.tzinfo is None:
                expiry = expiry.replace(tzinfo=timezone.utc)
            return expiry > datetime.now(timezone.utc)
        except Exception:
            return False

    def reload(self) -> None:
        """Force reload the certificate and key from disk on next access."""
        with self._lock:
            self._cert_pem = None
            self._key_pem = None
            self._cert_info = None
            self._loaded_at = None

    # ── Private loaders ────────────────────────────────────────────────────

    def _load_certificate(self) -> Tuple[Optional[bytes], Optional[str]]:
        """Load device certificate PEM from config-specified path."""
        try:
            from src.config import get_config
            config = get_config()
        except Exception as exc:
            return None, f"Config load failed: {exc}"

        cert_path = Path(config.device_cert_path)
        if cert_path.exists():
            try:
                pem = cert_path.read_bytes()
                logger.info("cert_loaded_from_file", path=str(cert_path))
                return pem, None
            except Exception as exc:
                return None, f"File read error: {exc}"

        # Platform-specific fallback
        import sys
        if sys.platform == "win32":
            return self._load_cert_from_windows_store()
        if sys.platform == "darwin":
            return self._load_cert_from_macos_keychain()

        return None, f"Certificate not found at {config.device_cert_path}"

    def _load_cert_from_windows_store(self) -> Tuple[Optional[bytes], Optional[str]]:
        """Load certificate from Windows LocalMachine\\My store via PowerShell."""
        try:
            result = subprocess.run(
                [
                    "powershell", "-NoProfile", "-NonInteractive", "-Command",
                    "Get-ChildItem -Path Cert:\\LocalMachine\\My | "
                    "Where-Object { $_.Subject -like '*medtrustx-device*' } | "
                    "Select-Object -First 1 | "
                    "ForEach-Object { "
                    "$pem = '-----BEGIN CERTIFICATE-----'; "
                    "$pem += [Convert]::ToBase64String($_.RawData, 'InsertLineBreaks'); "
                    "$pem += '-----END CERTIFICATE-----'; $pem }",
                ],
                capture_output=True, text=True, timeout=10,
            )
            output = result.stdout.strip()
            if "BEGIN CERTIFICATE" in output:
                return output.encode(), None
            return None, "No MedTrustX certificate in Windows store"
        except Exception as exc:
            return None, str(exc)

    def _load_cert_from_macos_keychain(self) -> Tuple[Optional[bytes], Optional[str]]:
        """Load certificate from macOS System keychain via security command."""
        try:
            result = subprocess.run(
                [
                    "security", "find-certificate",
                    "-c", "medtrustx-device",
                    "-p",
                    "/Library/Keychains/System.keychain",
                ],
                capture_output=True, text=True, timeout=10,
            )
            if result.returncode == 0 and "BEGIN CERTIFICATE" in result.stdout:
                return result.stdout.encode(), None
            return None, "No MedTrustX certificate in macOS keychain"
        except Exception as exc:
            return None, str(exc)

    def _load_private_key(self) -> Tuple[Optional[bytes], Optional[str]]:
        """Load device private key PEM from config-specified path."""
        try:
            from src.config import get_config
            config = get_config()
        except Exception as exc:
            return None, f"Config load failed: {exc}"

        key_path = Path(config.device_key_path)
        if key_path.exists():
            try:
                # Verify key file has restricted permissions
                mode = key_path.stat().st_mode & 0o777
                if mode & 0o044:
                    logger.warning(
                        "private_key_world_readable",
                        path=str(key_path),
                        mode=oct(mode),
                    )
                return key_path.read_bytes(), None
            except Exception as exc:
                return None, f"Key read error: {exc}"
        return None, f"Private key not found at {config.device_key_path}"

    def _parse_cert_info(self, cert_pem: bytes) -> Dict[str, Any]:
        """Parse certificate metadata from PEM bytes."""
        info: Dict[str, Any] = {}
        try:
            from cryptography import x509
            from cryptography.hazmat.backends import default_backend
            from cryptography.x509.oid import NameOID, ExtensionOID

            cert = x509.load_pem_x509_certificate(cert_pem, default_backend())
            info["subject"] = cert.subject.rfc4514_string()
            info["issuer"] = cert.issuer.rfc4514_string()
            info["serial_number"] = str(cert.serial_number)
            info["not_before"] = cert.not_valid_before_utc.isoformat()
            info["not_after"] = cert.not_valid_after_utc.isoformat()

            try:
                cn = cert.subject.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value
                info["common_name"] = cn
            except (IndexError, Exception):
                pass

            # Extract OCSP URL from AIA
            try:
                from cryptography.x509.oid import AuthorityInformationAccessOID
                aia = cert.extensions.get_extension_for_oid(
                    ExtensionOID.AUTHORITY_INFORMATION_ACCESS
                ).value
                for access in aia:
                    if access.access_method == AuthorityInformationAccessOID.OCSP:
                        info["ocsp_url"] = access.access_location.value
                        break
            except Exception:
                pass

        except ImportError:
            # Fallback: use openssl
            try:
                import tempfile
                with tempfile.NamedTemporaryFile(suffix=".pem", delete=False) as f:
                    f.write(cert_pem)
                    tmp = f.name
                result = subprocess.run(
                    ["openssl", "x509", "-noout", "-subject", "-issuer",
                     "-dates", "-serial", "-in", tmp],
                    capture_output=True, text=True, timeout=5,
                )
                Path(tmp).unlink(missing_ok=True)
                import re
                for line in result.stdout.splitlines():
                    if line.startswith("notAfter="):
                        info["not_after"] = line.split("=", 1)[1]
                    elif line.startswith("notBefore="):
                        info["not_before"] = line.split("=", 1)[1]
                    elif line.startswith("subject="):
                        info["subject"] = line.split("=", 1)[1]
            except Exception as exc:
                logger.warning("openssl_cert_parse_failed", error=str(exc))

        except Exception as exc:
            logger.warning("cert_info_parse_failed", error=str(exc))

        return info
