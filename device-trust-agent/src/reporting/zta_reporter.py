"""
MedTrustX Device Trust Agent — ZTA Service Reporter.

Reports TrustReport to zta-service via HTTPS POST with PQC JWT
device certificate authentication. Handles mTLS and retries.

Endpoint: POST {ZTA_SERVICE_URL}/api/zta/device/attest
"""

from __future__ import annotations

import json
from typing import Any, Dict, Optional

import httpx
import structlog

from src.models.trust_report import TrustReport
from src.reporting.base_reporter import BaseReporter

logger = structlog.get_logger(__name__)

ZTA_ATTEST_PATH = "/api/zta/device/attest"
ZTA_REGISTER_PATH = "/api/zta/device/register"
ZTA_BROWSER_ATTEST_PATH = "/api/zta/browser-attest"
REQUEST_TIMEOUT_SECONDS = 15.0


class ZtaReporter(BaseReporter):
    """Reports trust attestation results to zta-service.

    Uses mTLS with the device certificate for transport-layer auth,
    plus a JWT in the Authorization header for application-layer auth.
    """

    @property
    def reporter_name(self) -> str:
        return "zta-service"

    async def report(self, trust_report: TrustReport) -> None:
        """POST the full TrustReport JSON to zta-service.

        Args:
            trust_report: Fully computed TrustReport.
        """
        from src.config import get_config
        config = get_config()

        url = f"{config.zta_service_url}{ZTA_ATTEST_PATH}"
        payload = trust_report.to_zta_payload()
        headers = self._build_headers(config, trust_report)

        # Build mTLS cert tuple if cert files exist
        cert = self._build_mtls_cert(config)

        logger.info(
            "zta_reporter_sending",
            device_id=trust_report.device_id[:16],
            trust_level=trust_report.trust_level.value,
            score=trust_report.composite_score,
            url=url,
        )

        async with httpx.AsyncClient(
            cert=cert,
            verify=self._get_ca_bundle(config),
            timeout=REQUEST_TIMEOUT_SECONDS,
        ) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()

        logger.info(
            "zta_reporter_success",
            status_code=response.status_code,
            device_id=trust_report.device_id[:16],
        )

    def _build_headers(self, config: Any, trust_report: TrustReport) -> Dict[str, str]:
        """Build HTTP headers including JWT device auth."""
        headers: Dict[str, str] = {
            "Content-Type": "application/json",
            "X-Agent-Version": config.agent_version,
            "X-Device-ID": trust_report.device_id,
            "X-Tenant-ID": trust_report.tenant_id,
        }
        jwt_token = self._build_device_jwt(config, trust_report)
        if jwt_token:
            headers["Authorization"] = f"Bearer {jwt_token}"
        return headers

    def _build_device_jwt(self, config: Any, trust_report: TrustReport) -> Optional[str]:
        """Build a short-lived device identity JWT for ZTA service auth."""
        try:
            from jose import jwt
            from datetime import datetime, timedelta, timezone
            import uuid

            now = datetime.now(timezone.utc)
            claims = {
                "iss": "medtrustx-device-agent",
                "sub": trust_report.device_id,
                "aud": "zta-service",
                "iat": int(now.timestamp()),
                "exp": int((now + timedelta(minutes=5)).timestamp()),
                "jti": str(uuid.uuid4()),
                "tenant_id": trust_report.tenant_id,
                "trust_level": trust_report.trust_level.value,
                "composite_score": trust_report.composite_score,
            }
            if not config.zta_service_jwt_secret:
                return None
            token = jwt.encode(claims, config.zta_service_jwt_secret, algorithm="HS256")
            return token
        except Exception as exc:
            logger.warning("jwt_build_failed", error=str(exc))
            return None

    def _build_mtls_cert(self, config: Any) -> Optional[tuple]:
        """Return (cert, key) tuple for mTLS if cert files exist."""
        from pathlib import Path
        cert_path = Path(config.zta_service_cert_path)
        key_path = Path(config.zta_service_key_path)
        if cert_path.exists() and key_path.exists():
            return (str(cert_path), str(key_path))
        return None

    def _get_ca_bundle(self, config: Any) -> Any:
        """Return CA bundle path or True (system CAs)."""
        from pathlib import Path
        ca_path = Path(config.root_ca_cert_path)
        if ca_path.exists():
            return str(ca_path)
        return True  # Use system CAs
