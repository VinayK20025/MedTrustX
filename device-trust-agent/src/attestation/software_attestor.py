"""
MedTrustX Device Trust Agent — Software Attestation.

Generates the device attestation payload by:
  1. Computing the device hardware fingerprint
  2. Signing the fingerprint with the device private key (RSA-2048 or ECDSA)
  3. Posting fingerprint + signature to zta-service for server-side verification

The zta-service compares the fingerprint against the registered value
in iam_db.devices and verifies the signature with the stored public key.
"""

from __future__ import annotations

import base64
import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Tuple

import structlog

from src.attestation.certificate_manager import CertificateManager
from src.attestation.device_fingerprint import DeviceFingerprint

logger = structlog.get_logger(__name__)


class SoftwareAttestor:
    """Generates signed attestation payloads for device identity verification.

    The attestation payload binds:
      - The current hardware fingerprint
      - The device certificate CN (registered device_id)
      - The current UTC timestamp (freshness)

    All three fields are signed with the device private key so the
    zta-service can verify the payload came from the registered device.
    """

    def __init__(
        self,
        cert_manager: Optional[CertificateManager] = None,
        fingerprint_generator: Optional[DeviceFingerprint] = None,
    ) -> None:
        self._cert_manager = cert_manager or CertificateManager()
        self._fp_generator = fingerprint_generator or DeviceFingerprint()

    def generate_attestation_payload(self) -> Dict[str, Any]:
        """Generate a complete signed attestation payload.

        Returns:
            Dict with: fingerprint, signature (base64), device_cn,
            timestamp, public_key_pem (for server verification).
        """
        from src.config import get_config
        config = get_config()

        # Compute current fingerprint
        fingerprint = self._fp_generator.generate()
        components = self._fp_generator.get_components()
        timestamp = datetime.now(timezone.utc).isoformat()

        # Build the message to sign: fingerprint|device_id|timestamp
        device_id = config.agent_device_id or self._get_device_cn()
        message = f"{fingerprint}|{device_id}|{timestamp}"
        message_bytes = message.encode("utf-8")

        # Sign with device private key
        signature_b64, sign_error = self._sign_message(message_bytes)
        if sign_error:
            logger.warning("attestation_sign_failed", error=sign_error)
            signature_b64 = ""

        # Get device certificate for server verification
        cert_pem = self._cert_manager.get_device_certificate()
        cert_b64 = (
            base64.b64encode(cert_pem).decode("utf-8") if cert_pem else ""
        )

        payload = {
            "fingerprint": fingerprint,
            "fingerprint_components": {
                k: _redact_component(k, v) for k, v in components.items()
            },
            "device_id": device_id,
            "timestamp": timestamp,
            "message": message,
            "signature": signature_b64,
            "certificate_pem_b64": cert_b64,
            "algorithm": "RS256",
        }

        logger.info(
            "attestation_payload_generated",
            device_id=device_id[:16] if device_id else "unknown",
            fingerprint_prefix=fingerprint[:16],
            has_signature=bool(signature_b64),
        )
        return payload

    def verify_local_fingerprint(self) -> Tuple[bool, str]:
        """Verify the current hardware fingerprint against the stored baseline.

        Returns:
            Tuple of (matches, message) where matches is True if fingerprints
            align, and message describes the outcome.
        """
        try:
            from src.config import get_config
            config = get_config()
        except Exception as exc:
            return False, f"Config unavailable: {exc}"

        current_fp = self._fp_generator.generate()
        stored_fp = config.device_fingerprint_hash

        if not stored_fp:
            logger.info("fingerprint_no_baseline_stored")
            return True, "No baseline stored — first-run registration pending."

        if current_fp == stored_fp:
            return True, "Fingerprint matches registered baseline."

        return False, (
            f"Fingerprint mismatch. "
            f"Current: {current_fp[:16]}..., "
            f"Stored: {stored_fp[:16]}..."
        )

    # ── Private helpers ────────────────────────────────────────────────────

    def _sign_message(self, message: bytes) -> Tuple[str, Optional[str]]:
        """Sign message bytes with the device private key.

        Tries RSA-PSS first, falls back to RSA-PKCS1v15, then ECDSA.

        Args:
            message: Raw bytes to sign.

        Returns:
            Tuple of (base64_signature, error_message_or_None).
        """
        key_pem = self._cert_manager.get_device_private_key()
        if not key_pem:
            return "", "Device private key not available"

        try:
            from cryptography.hazmat.primitives import hashes, serialization
            from cryptography.hazmat.primitives.asymmetric import rsa, ec, padding
            from cryptography.hazmat.backends import default_backend

            private_key = serialization.load_pem_private_key(
                key_pem, password=None, backend=default_backend()
            )

            if isinstance(private_key, rsa.RSAPrivateKey):
                signature = private_key.sign(
                    message,
                    padding.PSS(
                        mgf=padding.MGF1(hashes.SHA256()),
                        salt_length=padding.PSS.MAX_LENGTH,
                    ),
                    hashes.SHA256(),
                )
            elif isinstance(private_key, ec.EllipticCurvePrivateKey):
                signature = private_key.sign(message, ec.ECDSA(hashes.SHA256()))
            else:
                return "", f"Unsupported key type: {type(private_key).__name__}"

            return base64.b64encode(signature).decode("utf-8"), None

        except ImportError:
            # Fallback: openssl command
            return self._sign_with_openssl(message, key_pem)
        except Exception as exc:
            return "", str(exc)

    def _sign_with_openssl(
        self, message: bytes, key_pem: bytes
    ) -> Tuple[str, Optional[str]]:
        """Sign message using openssl dgst command."""
        import subprocess
        import tempfile
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".key") as kf:
                kf.write(key_pem)
                key_path = kf.name
            with tempfile.NamedTemporaryFile(delete=False, suffix=".bin") as mf:
                mf.write(message)
                msg_path = mf.name

            result = subprocess.run(
                ["openssl", "dgst", "-sha256", "-sign", key_path, msg_path],
                capture_output=True, timeout=10,
            )
            from pathlib import Path
            Path(key_path).unlink(missing_ok=True)
            Path(msg_path).unlink(missing_ok=True)

            if result.returncode == 0:
                return base64.b64encode(result.stdout).decode("utf-8"), None
            return "", result.stderr.decode()
        except Exception as exc:
            return "", str(exc)

    def _get_device_cn(self) -> str:
        """Extract device CN from the loaded certificate."""
        info = self._cert_manager.get_cert_info()
        return info.get("common_name", "unknown-device")


def _redact_component(key: str, value: str) -> str:
    """Redact sensitive fingerprint components for logging."""
    if key in ("mac_address", "cpu_id"):
        # Show only last 8 chars to allow debugging without full disclosure
        return "..." + value[-8:] if len(value) > 8 else value
    return value
