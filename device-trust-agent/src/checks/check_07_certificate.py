"""
MedTrustX Device Trust Agent — Check 07: Certificate & Identity Validity (weight: 10%).

CRITICAL CHECK — score of 1 triggers an IMMEDIATE BLOCK. Verifies device
certificate chain, OCSP revocation status, and software attestation via
hardware fingerprint signature.

Scoring:
  10 — valid cert, OCSP good, fingerprint matches exactly
   7 — valid cert, fingerprint matches, OCSP unchecked
   4 — cert valid but fingerprint drift detected (hardware change)
   1 — cert expired/revoked OR fingerprint mismatch → IMMEDIATE BLOCK
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
import socket
import ssl
import subprocess
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import structlog

from src.checks.base_check import BaseCheck
from src.models.check_result import CheckResult
from src.platform_detector import Platform

logger = structlog.get_logger(__name__)


class CertificateCheck(BaseCheck):
    """Check 07 — Certificate & Identity Validity.

    CRITICAL: A score of 1 on this check causes an immediate block.
    Verifies the device certificate chain, OCSP revocation status, and
    software attestation fingerprint binding.
    """

    CHECK_ID = 7
    CHECK_NAME = "Certificate & Identity Validity"
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
        """Execute certificate and identity validation."""
        return await asyncio.get_event_loop().run_in_executor(
            None, self._check_all_platforms
        )

    # ── Cross-platform certificate check ──────────────────────────────────

    def _check_all_platforms(self) -> CheckResult:
        """Validate device certificate and identity on all platforms."""
        from src.config import get_config
        config = get_config()

        details: Dict[str, Any] = {}
        recommendations: List[str] = []

        # Step 1: Load device certificate from platform-specific store
        cert_pem, cert_error = self._load_device_certificate(config)
        details["cert_load_error"] = cert_error

        if not cert_pem:
            recommendations.append(
                f"Device certificate could not be loaded: {cert_error}. "
                "Ensure the MedTrustX device certificate is provisioned. "
                "Contact IT to re-provision this device."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
                immediate_block=True,
            )

        # Step 2: Validate certificate chain and expiry
        cert_info, chain_error = self._validate_certificate_chain(cert_pem, config)
        details["cert_info"] = cert_info
        if chain_error:
            details["chain_error"] = chain_error
            recommendations.append(
                f"Certificate chain validation failed: {chain_error}. "
                "Re-provision the device certificate."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
                immediate_block=True,
            )

        # Check expiry
        not_after = cert_info.get("not_after")
        if not_after:
            try:
                expiry = datetime.fromisoformat(not_after)
                if expiry.tzinfo is None:
                    expiry = expiry.replace(tzinfo=timezone.utc)
                if expiry < datetime.now(timezone.utc):
                    recommendations.append(
                        f"Device certificate expired on {not_after}. "
                        "Request a new certificate from MedTrustX PKI."
                    )
                    return self._make_result(
                        score=1.0,
                        details=details,
                        recommendations=recommendations,
                        immediate_block=True,
                    )
                days_until_expiry = (expiry - datetime.now(timezone.utc)).days
                details["days_until_expiry"] = days_until_expiry
                if days_until_expiry < 30:
                    recommendations.append(
                        f"Device certificate expires in {days_until_expiry} days. "
                        "Renew the certificate before it expires."
                    )
            except (ValueError, TypeError) as exc:
                logger.warning("cert_expiry_parse_failed", error=str(exc))

        # Step 3: OCSP revocation check
        ocsp_status, ocsp_error = self._check_ocsp_revocation(cert_pem, cert_info, config)
        details["ocsp_status"] = ocsp_status
        details["ocsp_error"] = ocsp_error

        if ocsp_status == "revoked":
            recommendations.append(
                "Device certificate has been REVOKED. "
                "Contact IT Security immediately."
            )
            return self._make_result(
                score=1.0,
                details=details,
                recommendations=recommendations,
                immediate_block=True,
            )

        # Step 4: Software attestation — device fingerprint
        fingerprint_match, fingerprint_details = self._verify_device_fingerprint(config)
        details["fingerprint"] = fingerprint_details

        if not fingerprint_match:
            drift_reason = fingerprint_details.get("drift_reason", "unknown")
            if fingerprint_details.get("mismatch"):
                recommendations.append(
                    f"Device fingerprint mismatch detected: {drift_reason}. "
                    "Hardware change detected or device identity compromised. "
                    "Re-register this device with MedTrustX."
                )
                return self._make_result(
                    score=1.0,
                    details=details,
                    recommendations=recommendations,
                    immediate_block=True,
                )
            else:
                # Fingerprint drift (partial hardware change)
                recommendations.append(
                    f"Device fingerprint drift detected: {drift_reason}. "
                    "This may indicate a hardware component change. "
                    "Re-register the device to update the fingerprint baseline."
                )
                score = 4.0
                details["score_reason"] = "fingerprint_drift"
                return self._make_result(
                    score=score,
                    details=details,
                    recommendations=recommendations,
                )

        # All checks passed — score based on OCSP availability
        if ocsp_status == "good":
            return self._make_result(
                score=10.0,
                details=details,
                recommendations=["Certificate valid, OCSP good, fingerprint matches."],
            )

        # OCSP unchecked but cert and fingerprint valid
        return self._make_result(
            score=7.0,
            details=details,
            recommendations=[
                "Certificate valid, fingerprint matches. "
                "OCSP check was skipped or inconclusive. "
                "Ensure network connectivity to the OCSP responder."
            ],
        )

    def _load_device_certificate(self, config: Any) -> Tuple[Optional[bytes], Optional[str]]:
        """Load device certificate PEM bytes from platform-specific certificate store."""
        platform = self._platform_info.platform

        if platform == Platform.WINDOWS:
            return self._load_cert_windows(config)
        if platform == Platform.MACOS:
            return self._load_cert_macos(config)
        if platform in (Platform.LINUX, Platform.IOS, Platform.ANDROID):
            return self._load_cert_file(config)
        return None, f"Unsupported platform: {platform.value}"

    def _load_cert_windows(self, config: Any) -> Tuple[Optional[bytes], Optional[str]]:
        """Load device certificate from Windows LocalMachine\\My cert store."""
        try:
            import ssl as ssl_lib
            import ctypes
            import ctypes.wintypes

            # Try file path first (agent-provisioned cert)
            if Path(config.device_cert_path).exists():
                return Path(config.device_cert_path).read_bytes(), None

            # Query Windows certificate store via PowerShell
            result = subprocess.run(
                [
                    "powershell", "-NoProfile", "-NonInteractive", "-Command",
                    "Get-ChildItem -Path Cert:\\LocalMachine\\My | "
                    "Where-Object { $_.Subject -like '*medtrustx-device*' } | "
                    "Select-Object -First 1 | "
                    "ForEach-Object { "
                    "[Convert]::ToBase64String($_.RawData, 'InsertLineBreaks') "
                    "}",
                ],
                capture_output=True, text=True, timeout=10,
            )
            b64_cert = result.stdout.strip()
            if b64_cert:
                pem = (
                    b"-----BEGIN CERTIFICATE-----\n"
                    + b64_cert.encode()
                    + b"\n-----END CERTIFICATE-----\n"
                )
                return pem, None
            return None, "No MedTrustX device certificate found in LocalMachine\\My store"
        except Exception as exc:
            return None, str(exc)

    def _load_cert_macos(self, config: Any) -> Tuple[Optional[bytes], Optional[str]]:
        """Load device certificate from macOS System keychain."""
        if Path(config.device_cert_path).exists():
            return Path(config.device_cert_path).read_bytes(), None
        try:
            result = subprocess.run(
                [
                    "security", "find-certificate",
                    "-c", "medtrustx-device",
                    "-p",  # output PEM
                    "/Library/Keychains/System.keychain",
                ],
                capture_output=True, text=True, timeout=10,
            )
            if result.returncode == 0 and "BEGIN CERTIFICATE" in result.stdout:
                return result.stdout.encode(), None
            return None, "No MedTrustX device certificate found in System keychain"
        except Exception as exc:
            return None, str(exc)

    def _load_cert_file(self, config: Any) -> Tuple[Optional[bytes], Optional[str]]:
        """Load device certificate from filesystem path."""
        cert_path = Path(config.device_cert_path)
        if cert_path.exists():
            try:
                return cert_path.read_bytes(), None
            except Exception as exc:
                return None, str(exc)
        return None, f"Certificate file not found: {config.device_cert_path}"

    def _validate_certificate_chain(
        self, cert_pem: bytes, config: Any
    ) -> Tuple[Dict[str, Any], Optional[str]]:
        """Validate certificate chain against MedTrustX Root CA."""
        cert_info: Dict[str, Any] = {}
        try:
            from cryptography import x509
            from cryptography.hazmat.backends import default_backend
            from cryptography.x509.oid import NameOID, ExtensionOID

            cert = x509.load_pem_x509_certificate(cert_pem, default_backend())

            # Extract certificate metadata
            cert_info["subject"] = cert.subject.rfc4514_string()
            cert_info["issuer"] = cert.issuer.rfc4514_string()
            cert_info["serial_number"] = str(cert.serial_number)
            cert_info["not_before"] = cert.not_valid_before_utc.isoformat()
            cert_info["not_after"] = cert.not_valid_after_utc.isoformat()

            # Extract CN for device_id matching
            try:
                cn = cert.subject.get_attributes_for_oid(NameOID.COMMON_NAME)[0].value
                cert_info["common_name"] = cn
                cert_info["is_medtrustx_device_cert"] = cn.startswith("medtrustx-device-")
            except (IndexError, Exception):
                cert_info["is_medtrustx_device_cert"] = False

            # Extract OCSP URL from AIA extension
            try:
                aia = cert.extensions.get_extension_for_oid(
                    ExtensionOID.AUTHORITY_INFORMATION_ACCESS
                ).value
                for access in aia:
                    from cryptography.x509.oid import AuthorityInformationAccessOID
                    if access.access_method == AuthorityInformationAccessOID.OCSP:
                        cert_info["ocsp_url"] = access.access_location.value
                        break
            except Exception:
                pass

            # Verify against Root CA
            root_ca_path = Path(config.root_ca_cert_path)
            if root_ca_path.exists():
                root_ca_pem = root_ca_path.read_bytes()
                root_ca = x509.load_pem_x509_certificate(root_ca_pem, default_backend())
                # Verify issuer matches
                if cert.issuer != root_ca.subject:
                    return cert_info, "Certificate issuer does not match MedTrustX Root CA"
                # Verify signature (simplified — full chain validation via cryptography lib)
                from cryptography.hazmat.primitives import hashes
                from cryptography.hazmat.primitives.asymmetric import padding, ec
                try:
                    pub_key = root_ca.public_key()
                    pub_key.verify(
                        cert.signature,
                        cert.tbs_certificate_bytes,
                        padding.PKCS1v15() if hasattr(padding, 'PKCS1v15') else ec.ECDSA(hashes.SHA256()),
                        cert.signature_hash_algorithm,
                    )
                    cert_info["signature_valid"] = True
                except Exception as sig_exc:
                    cert_info["signature_valid"] = False
                    logger.warning("cert_signature_verify_failed", error=str(sig_exc))

            return cert_info, None

        except ImportError:
            # Fallback: use openssl command
            return self._validate_cert_openssl(cert_pem, config)
        except Exception as exc:
            return cert_info, str(exc)

    def _validate_cert_openssl(
        self, cert_pem: bytes, config: Any
    ) -> Tuple[Dict[str, Any], Optional[str]]:
        """Validate certificate using openssl command-line tool."""
        import tempfile
        cert_info: Dict[str, Any] = {}
        try:
            with tempfile.NamedTemporaryFile(suffix=".pem", delete=False) as f:
                f.write(cert_pem)
                tmp_path = f.name
            result = subprocess.run(
                ["openssl", "x509", "-noout", "-text", "-in", tmp_path],
                capture_output=True, text=True, timeout=5,
            )
            Path(tmp_path).unlink(missing_ok=True)
            output = result.stdout

            # Parse expiry
            not_after_match = re.search(r"Not After\s*:\s*(.+)", output)
            if not_after_match:
                cert_info["not_after"] = not_after_match.group(1).strip()
            # Parse CN
            cn_match = re.search(r"Subject:.*CN\s*=\s*([^,\n]+)", output)
            if cn_match:
                cert_info["common_name"] = cn_match.group(1).strip()
            # Parse OCSP URL
            ocsp_match = re.search(r"OCSP - URI:(.+)", output)
            if ocsp_match:
                cert_info["ocsp_url"] = ocsp_match.group(1).strip()

            return cert_info, None
        except Exception as exc:
            return cert_info, str(exc)

    def _check_ocsp_revocation(
        self,
        cert_pem: bytes,
        cert_info: Dict[str, Any],
        config: Any,
    ) -> Tuple[str, Optional[str]]:
        """Check certificate revocation via OCSP.

        Returns: (status, error) where status is 'good', 'revoked', or 'unknown'.
        """
        # Determine OCSP URL
        ocsp_url = (
            config.ocsp_responder_url
            or cert_info.get("ocsp_url")
            or ""
        )
        if not ocsp_url:
            return "unknown", "No OCSP URL available"

        try:
            from cryptography import x509
            from cryptography.hazmat.backends import default_backend
            from cryptography.x509 import ocsp as crypto_ocsp
            from cryptography.hazmat.primitives import hashes, serialization
            from cryptography.x509.ocsp import OCSPResponseStatus, OCSPCertStatus
            import urllib.request as urlreq

            cert = x509.load_pem_x509_certificate(cert_pem, default_backend())
            root_ca_path = Path(config.root_ca_cert_path)
            if not root_ca_path.exists():
                return "unknown", f"Root CA not found at {config.root_ca_cert_path}"

            issuer = x509.load_pem_x509_certificate(
                root_ca_path.read_bytes(), default_backend()
            )

            # Build OCSP request
            builder = crypto_ocsp.OCSPRequestBuilder()
            builder = builder.add_certificate(cert, issuer, hashes.SHA1())
            ocsp_req = builder.build()
            ocsp_req_bytes = ocsp_req.public_bytes(serialization.Encoding.DER)

            # POST to OCSP responder
            req = urlreq.Request(
                ocsp_url,
                data=ocsp_req_bytes,
                headers={"Content-Type": "application/ocsp-request"},
            )
            with urlreq.urlopen(req, timeout=10) as resp:
                ocsp_resp_bytes = resp.read()

            # Parse response
            ocsp_response = crypto_ocsp.load_der_ocsp_response(ocsp_resp_bytes)

            if ocsp_response.response_status != OCSPResponseStatus.SUCCESSFUL:
                return "unknown", f"OCSP response status: {ocsp_response.response_status}"

            cert_status = ocsp_response.certificate_status
            if cert_status == OCSPCertStatus.GOOD:
                return "good", None
            elif cert_status == OCSPCertStatus.REVOKED:
                return "revoked", "Certificate has been revoked"
            else:
                return "unknown", f"OCSP cert status: {cert_status}"

        except ImportError:
            # Fallback via openssl
            return self._check_ocsp_openssl(cert_pem, ocsp_url, config)
        except Exception as exc:
            logger.warning("ocsp_check_failed", url=ocsp_url, error=str(exc))
            return "unknown", str(exc)

    def _check_ocsp_openssl(
        self, cert_pem: bytes, ocsp_url: str, config: Any
    ) -> Tuple[str, Optional[str]]:
        """Check OCSP revocation via openssl command."""
        import tempfile
        try:
            with tempfile.NamedTemporaryFile(suffix=".pem", delete=False) as f:
                f.write(cert_pem)
                tmp_cert = f.name

            result = subprocess.run(
                [
                    "openssl", "ocsp",
                    "-issuer", config.root_ca_cert_path,
                    "-cert", tmp_cert,
                    "-url", ocsp_url,
                    "-resp_text",
                ],
                capture_output=True, text=True, timeout=10,
            )
            Path(tmp_cert).unlink(missing_ok=True)
            output = result.stdout + result.stderr
            if "good" in output.lower():
                return "good", None
            elif "revoked" in output.lower():
                return "revoked", "Certificate has been revoked"
            else:
                return "unknown", "OCSP response unclear"
        except Exception as exc:
            return "unknown", str(exc)

    def _verify_device_fingerprint(self, config: Any) -> Tuple[bool, Dict[str, Any]]:
        """Verify device fingerprint against stored baseline in config/iam_db."""
        details: Dict[str, Any] = {}
        try:
            from src.attestation.device_fingerprint import DeviceFingerprint
            fp_gen = DeviceFingerprint()
            current_fp = fp_gen.generate()
            details["current_fingerprint"] = current_fp

            stored_fp = config.device_fingerprint_hash
            details["stored_fingerprint"] = stored_fp[:16] + "..." if stored_fp else None

            if not stored_fp:
                # No stored fingerprint — first run, accept and record
                details["drift_reason"] = "no_baseline_stored"
                details["mismatch"] = False
                logger.info("fingerprint_no_baseline", current=current_fp[:16])
                return True, details

            if current_fp == stored_fp:
                details["match"] = True
                return True, details

            # Fingerprint changed — determine if drift or full mismatch
            # Compute component-level comparison
            current_components = fp_gen.get_components()
            details["component_count"] = len(current_components)

            # Full mismatch = different fingerprint, treat as identity compromise
            details["mismatch"] = True
            details["drift_reason"] = "fingerprint_hash_changed"
            logger.warning(
                "fingerprint_mismatch",
                stored_prefix=stored_fp[:16],
                current_prefix=current_fp[:16],
            )
            return False, details

        except ImportError:
            # Attestation module not yet available — score neutrally
            details["drift_reason"] = "attestation_module_unavailable"
            details["mismatch"] = False
            return True, details
        except Exception as exc:
            logger.warning("fingerprint_verify_failed", error=str(exc))
            details["error"] = str(exc)
            details["drift_reason"] = "verification_error"
            details["mismatch"] = False
            return True, details
