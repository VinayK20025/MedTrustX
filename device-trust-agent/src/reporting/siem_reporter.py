"""
MedTrustX Device Trust Agent — SIEM Reporter (CEF syslog RFC 5424).

Sends TrustReport check results to the SIEM via UDP syslog in
Common Event Format (CEF). One CEF message is sent per check result
plus one summary message for the composite score.

Protocol: UDP syslog to medtrust-siem:514
Format:   CEF:0|MedTrustX|DeviceTrustAgent|1.0|{check_id}|{name}|{sev}|ext=...
Facility: 10 (security/authorization messages)
"""

from __future__ import annotations

import socket
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import structlog

from src.models.check_result import CheckResult
from src.models.trust_level import TrustLevel
from src.models.trust_report import TrustReport
from src.reporting.base_reporter import BaseReporter

logger = structlog.get_logger(__name__)

# Syslog facility 10 = security/authorization
SYSLOG_FACILITY = 10

# CEF header template
CEF_VERSION = "CEF:0"
CEF_MAX_MESSAGE_SIZE = 1024  # bytes, safe UDP syslog limit

# Summary check ID used for the composite score syslog message
COMPOSITE_SCORE_SIGNATURE_ID = "COMPOSITE"


class SiemReporter(BaseReporter):
    """Sends TrustReport data to SIEM via CEF-formatted UDP syslog.

    Sends one syslog message per check result (10 messages) plus one
    summary message carrying the composite score and trust level.
    """

    @property
    def reporter_name(self) -> str:
        return "siem-syslog"

    async def report(self, trust_report: TrustReport) -> None:
        """Send all check results and composite score to SIEM via CEF syslog.

        Runs synchronously in an executor to avoid blocking the event loop
        on UDP socket I/O.
        """
        import asyncio
        await asyncio.get_event_loop().run_in_executor(
            None, self._send_all_cef_messages, trust_report
        )

    def _send_all_cef_messages(self, trust_report: TrustReport) -> None:
        """Build and send all CEF syslog messages for a TrustReport."""
        from src.config import get_config
        config = get_config()

        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.settimeout(5.0)
        except Exception as exc:
            logger.error("siem_socket_create_failed", error=str(exc))
            return

        try:
            siem_host = config.siem_host
            siem_port = config.siem_port
            now = datetime.now(timezone.utc)

            messages_sent = 0
            messages_failed = 0

            # Send one CEF message per check result
            for check_result in trust_report.check_results:
                cef_msg = self._build_check_cef(
                    check_result, trust_report, config, now
                )
                syslog_msg = self._wrap_rfc5424(
                    cef_msg,
                    severity=trust_report.trust_level.siem_severity,
                    facility=SYSLOG_FACILITY,
                    hostname=trust_report.device_id[:32],
                    app_name="DeviceTrustAgent",
                    timestamp=now,
                )
                if self._send_udp(sock, siem_host, siem_port, syslog_msg):
                    messages_sent += 1
                else:
                    messages_failed += 1

            # Send composite score summary message
            composite_cef = self._build_composite_cef(trust_report, config, now)
            composite_syslog = self._wrap_rfc5424(
                composite_cef,
                severity=trust_report.trust_level.siem_severity,
                facility=SYSLOG_FACILITY,
                hostname=trust_report.device_id[:32],
                app_name="DeviceTrustAgent",
                timestamp=now,
            )
            if self._send_udp(sock, siem_host, siem_port, composite_syslog):
                messages_sent += 1
            else:
                messages_failed += 1

            logger.info(
                "siem_report_sent",
                messages_sent=messages_sent,
                messages_failed=messages_failed,
                trust_level=trust_report.trust_level.value,
            )

        finally:
            sock.close()

    def _build_check_cef(
        self,
        check: CheckResult,
        report: TrustReport,
        config: Any,
        now: datetime,
    ) -> str:
        """Build a CEF-formatted string for a single check result.

        CEF format: CEF:Version|Device Vendor|Device Product|Device Version|
                    Signature ID|Name|Severity|Extension
        """
        severity = check.score_to_cef_severity()

        # CEF header
        header = "|".join([
            CEF_VERSION,
            _cef_escape(config.siem_device_vendor),
            _cef_escape(config.siem_device_product),
            _cef_escape(config.siem_device_version),
            f"CHECK_{check.check_id:02d}",
            _cef_escape(check.check_name),
            str(severity),
        ])

        # CEF extension key=value pairs
        ext = _build_extension({
            "rt": str(int(now.timestamp() * 1000)),  # receipt time ms
            "deviceExternalId": report.device_id,
            "src": report.device_id,
            "dvchost": report.device_id[:32],
            "cs1": report.tenant_id,
            "cs1Label": "tenantId",
            "cs2": report.platform,
            "cs2Label": "platform",
            "cs3": report.agent_mode,
            "cs3Label": "agentMode",
            "cn1": str(check.score),
            "cn1Label": "checkScore",
            "cn2": str(check.weighted_score),
            "cn2Label": "weightedScore",
            "cn3": str(report.composite_score),
            "cn3Label": "compositeScore",
            "outcome": "pass" if check.passed else "fail",
            "reason": _cef_escape(
                check.recommendations[0][:200] if check.recommendations else ""
            ),
            "act": "block" if check.immediate_block else "allow",
            "flexString1": "true" if check.immediate_block else "false",
            "flexString1Label": "immediateBlock",
            "durationMs": str(check.duration_ms),
        })

        return f"{header}|{ext}"

    def _build_composite_cef(
        self,
        report: TrustReport,
        config: Any,
        now: datetime,
    ) -> str:
        """Build CEF summary message carrying the composite trust score."""
        severity = report.trust_level.cef_severity

        header = "|".join([
            CEF_VERSION,
            _cef_escape(config.siem_device_vendor),
            _cef_escape(config.siem_device_product),
            _cef_escape(config.siem_device_version),
            COMPOSITE_SCORE_SIGNATURE_ID,
            "Device Trust Score",
            str(severity),
        ])

        check_scores = report.get_check_scores_dict()
        ext = _build_extension({
            "rt": str(int(now.timestamp() * 1000)),
            "deviceExternalId": report.device_id,
            "src": report.device_id,
            "dvchost": report.device_id[:32],
            "cs1": report.tenant_id,
            "cs1Label": "tenantId",
            "cs2": report.platform,
            "cs2Label": "platform",
            "cs3": report.trust_level.value,
            "cs3Label": "trustLevel",
            "cs4": report.report_id,
            "cs4Label": "reportId",
            "cn1": str(report.composite_score),
            "cn1Label": "compositeScore",
            "cn2": str(int(report.access_policy.session_duration_seconds)),
            "cn2Label": "sessionDurationSeconds",
            "act": "block" if report.trust_level.revoke_sessions else "allow",
            "outcome": report.trust_level.value.lower(),
            "flexString1": "true" if report.override_applied else "false",
            "flexString1Label": "overrideApplied",
            "msg": _cef_escape(report.override_reason or ""),
            **{
                f"flexNumber{i+1}": str(score)
                for i, (key, score) in enumerate(list(check_scores.items())[:5])
            },
        })

        return f"{header}|{ext}"

    def _wrap_rfc5424(
        self,
        message: str,
        severity: int,
        facility: int,
        hostname: str,
        app_name: str,
        timestamp: datetime,
    ) -> bytes:
        """Wrap a CEF message in an RFC 5424 syslog frame.

        Format: <PRI>VERSION TIMESTAMP HOSTNAME APP-NAME PROCID MSGID STRUCTURED-DATA MSG

        Args:
            message: CEF message string.
            severity: RFC 5424 severity (0–7).
            facility: RFC 5424 facility (0–23).
            hostname: Syslog HOSTNAME field.
            app_name: Syslog APP-NAME field.
            timestamp: Message timestamp.

        Returns:
            UTF-8 encoded syslog frame bytes.
        """
        priority = (facility * 8) + severity
        ts = timestamp.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        # RFC 5424 frame: <PRI>1 TIMESTAMP HOSTNAME APP-NAME PROCID MSGID - MSG
        frame = f"<{priority}>1 {ts} {hostname[:255]} {app_name} - - - {message}"
        # Truncate to safe UDP size
        encoded = frame.encode("utf-8")
        if len(encoded) > CEF_MAX_MESSAGE_SIZE:
            encoded = encoded[:CEF_MAX_MESSAGE_SIZE]
        return encoded

    def _send_udp(
        self,
        sock: socket.socket,
        host: str,
        port: int,
        data: bytes,
    ) -> bool:
        """Send bytes via UDP. Returns True on success."""
        try:
            sock.sendto(data, (host, port))
            return True
        except Exception as exc:
            logger.warning("siem_udp_send_failed", host=host, port=port, error=str(exc))
            return False

    def build_cef_message(
        self,
        check: CheckResult,
        report: TrustReport,
    ) -> str:
        """Public API: build a single CEF message string for a check result.

        Exposed for testing and external use.
        """
        from src.config import get_config
        config = get_config()
        now = datetime.now(timezone.utc)
        return self._build_check_cef(check, report, config, now)


# ── Module-level CheckResult extension ────────────────────────────────────

def _patch_check_result_cef() -> None:
    """Add score_to_cef_severity() method to CheckResult if not present."""
    from src.models.check_result import CheckResult as CR
    if not hasattr(CR, "score_to_cef_severity"):
        def score_to_cef_severity(self: Any) -> int:
            if self.immediate_block or self.score <= 1.0:
                return 10
            if self.score <= 3.0:
                return 8
            if self.score <= 5.0:
                return 6
            if self.score <= 7.0:
                return 4
            if self.score <= 8.5:
                return 2
            return 1
        CR.score_to_cef_severity = score_to_cef_severity  # type: ignore[attr-defined]


_patch_check_result_cef()


# ── CEF helpers ────────────────────────────────────────────────────────────

def _cef_escape(value: str) -> str:
    """Escape special characters in CEF header fields."""
    return (
        str(value)
        .replace("\\", "\\\\")
        .replace("|", "\\|")
        .replace("\n", " ")
        .replace("\r", " ")
    )


def _ext_escape(value: str) -> str:
    """Escape special characters in CEF extension values."""
    return (
        str(value)
        .replace("\\", "\\\\")
        .replace("=", "\\=")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
    )


def _build_extension(fields: Dict[str, str]) -> str:
    """Build CEF extension string from a dict of key=value pairs."""
    return " ".join(
        f"{k}={_ext_escape(v)}"
        for k, v in fields.items()
        if v is not None and v != ""
    )
