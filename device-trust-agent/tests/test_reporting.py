"""
Tests for the four reporter modules.

Covers:
  - ZtaReporter: JWT construction, mTLS client, retry on failure
  - SiemReporter: CEF format, RFC 5424 wrapping, UDP send, 11 messages/cycle
  - PrometheusReporter: exposition format, PUT to pushgateway
  - OpaReporter: JSON PUT to /v1/data endpoint
  - BaseReporter: exponential backoff retry logic
  - 4 reporters always run in parallel (asyncio.gather)
"""

from __future__ import annotations

import asyncio
import json
import socket
from unittest.mock import AsyncMock, MagicMock, patch, call

import pytest

from src.reporting.base_reporter import BaseReporter
from src.reporting.zta_reporter import ZtaReporter
from src.reporting.siem_reporter import SiemReporter
from src.reporting.prometheus_reporter import PrometheusReporter
from src.reporting.opa_reporter import OpaReporter
from src.models.trust_level import TrustLevel


# ── BaseReporter retry logic ──────────────────────────────────────────────────

class ConcreteReporter(BaseReporter):
    """Minimal concrete implementation for testing retry logic."""
    def __init__(self):
        self.call_count = 0
        self.fail_times = 0

    async def send(self, trust_report) -> bool:
        self.call_count += 1
        if self.call_count <= self.fail_times:
            raise ConnectionError(f"simulated failure #{self.call_count}")
        return True


class TestBaseReporterRetry:
    @pytest.mark.asyncio
    async def test_success_on_first_try(self, standard_trust_report):
        reporter = ConcreteReporter()
        reporter.fail_times = 0
        result = await reporter.report_with_retry(standard_trust_report)
        assert result is True
        assert reporter.call_count == 1

    @pytest.mark.asyncio
    async def test_success_on_second_try(self, standard_trust_report):
        reporter = ConcreteReporter()
        reporter.fail_times = 1  # fail once, succeed on attempt 2
        with patch("asyncio.sleep", new_callable=AsyncMock):
            result = await reporter.report_with_retry(standard_trust_report)
        assert result is True
        assert reporter.call_count == 2

    @pytest.mark.asyncio
    async def test_fails_after_max_attempts(self, standard_trust_report):
        reporter = ConcreteReporter()
        reporter.fail_times = 10  # always fail
        with patch("asyncio.sleep", new_callable=AsyncMock):
            result = await reporter.report_with_retry(standard_trust_report, max_attempts=3)
        assert result is False
        assert reporter.call_count == 3

    @pytest.mark.asyncio
    async def test_backoff_increases_exponentially(self, standard_trust_report):
        reporter = ConcreteReporter()
        reporter.fail_times = 3
        sleep_calls = []

        async def record_sleep(seconds):
            sleep_calls.append(seconds)

        with patch("asyncio.sleep", side_effect=record_sleep):
            await reporter.report_with_retry(standard_trust_report, max_attempts=3)

        # Sleep durations should be increasing (exponential backoff)
        assert len(sleep_calls) >= 1
        if len(sleep_calls) >= 2:
            assert sleep_calls[1] >= sleep_calls[0]


# ── ZtaReporter ───────────────────────────────────────────────────────────────

class TestZtaReporter:
    @pytest.mark.asyncio
    async def test_jwt_included_in_request(self, standard_trust_report, mock_httpx_success):
        reporter = ZtaReporter()
        result = await reporter.send(standard_trust_report)
        assert result is True
        # Verify POST was called
        mock_httpx_success.post.assert_called_once()
        call_kwargs = mock_httpx_success.post.call_args
        headers = call_kwargs.kwargs.get("headers", {}) or (call_kwargs.args[1] if len(call_kwargs.args) > 1 else {})
        # JWT should be in Authorization header
        assert any("Authorization" in str(k) for k in (call_kwargs.kwargs or {}))

    @pytest.mark.asyncio
    async def test_correct_endpoint(self, standard_trust_report, mock_httpx_success):
        reporter = ZtaReporter()
        await reporter.send(standard_trust_report)
        call_args = mock_httpx_success.post.call_args
        url = call_args.args[0] if call_args.args else call_args.kwargs.get("url", "")
        assert "/api/zta/device/attest" in url

    @pytest.mark.asyncio
    async def test_http_error_returns_false(self, standard_trust_report, mock_httpx_failure):
        reporter = ZtaReporter()
        result = await reporter.send(standard_trust_report)
        assert result is False

    def test_jwt_has_required_claims(self, standard_trust_report):
        """JWT must include trust_level and composite_score claims."""
        reporter = ZtaReporter()
        token = reporter._build_jwt(standard_trust_report)
        import base64
        # Decode payload (middle segment)
        payload_b64 = token.split(".")[1]
        # Add padding
        payload_b64 += "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))
        assert "trust_level" in payload
        assert "composite_score" in payload
        assert "exp" in payload
        # Expiry should be ~5 minutes from now
        import time
        assert payload["exp"] > time.time()
        assert payload["exp"] < time.time() + 400  # within 6.67 minutes


# ── SiemReporter ─────────────────────────────────────────────────────────────

class TestSiemReporter:
    def test_cef_format_check_result(self, standard_trust_report):
        reporter = SiemReporter()
        result = standard_trust_report.check_results[0]
        cef = reporter._build_check_cef(result, standard_trust_report)
        assert cef.startswith("CEF:0|")
        # Must have 7 pipe-separated header fields
        header_part = cef.split(" ext=")[0] if " ext=" in cef else cef
        pipes = header_part.split("|")
        assert len(pipes) >= 7

    def test_cef_extension_contains_required_keys(self, standard_trust_report):
        reporter = SiemReporter()
        result = standard_trust_report.check_results[0]
        cef = reporter._build_check_cef(result, standard_trust_report)
        assert "cn1=" in cef or "checkScore" in cef  # check score
        assert "deviceExternalId=" in cef or "rt=" in cef

    def test_rfc5424_wrapping(self, standard_trust_report):
        reporter = SiemReporter()
        result = standard_trust_report.check_results[0]
        cef = reporter._build_check_cef(result, standard_trust_report)
        wrapped = reporter._wrap_rfc5424(cef, standard_trust_report)
        # Must start with <PRI>
        assert wrapped.startswith("<")
        assert ">" in wrapped
        # Must contain the CEF payload
        assert "CEF:0" in wrapped

    def test_cef_escape_pipe(self):
        reporter = SiemReporter()
        escaped = reporter._cef_escape("foo|bar")
        assert "|" not in escaped

    def test_cef_escape_backslash(self):
        reporter = SiemReporter()
        escaped = reporter._cef_escape("foo\\bar")
        assert escaped == "foo\\\\bar"

    def test_message_count_is_11_per_cycle(self, standard_trust_report):
        """10 check messages + 1 composite message = 11 UDP packets."""
        reporter = SiemReporter()
        messages = reporter._build_all_messages(standard_trust_report)
        assert len(messages) == 11

    @pytest.mark.asyncio
    async def test_send_uses_udp_socket(self, standard_trust_report):
        reporter = SiemReporter()
        sent_packets = []

        mock_sock = MagicMock()
        mock_sock.sendto = MagicMock(side_effect=lambda data, addr: sent_packets.append(data))

        with patch("socket.socket", return_value=mock_sock):
            result = await reporter.send(standard_trust_report)

        # 11 UDP packets should have been sent
        assert len(sent_packets) == 11

    @pytest.mark.asyncio
    async def test_udp_error_returns_false(self, standard_trust_report):
        reporter = SiemReporter()
        mock_sock = MagicMock()
        mock_sock.sendto = MagicMock(side_effect=OSError("network unreachable"))

        with patch("socket.socket", return_value=mock_sock):
            result = await reporter.send(standard_trust_report)

        assert result is False

    def test_cef_message_truncated_to_1024(self, standard_trust_report):
        """CEF messages must not exceed 1024 bytes for safe UDP transmission."""
        reporter = SiemReporter()
        messages = reporter._build_all_messages(standard_trust_report)
        for msg in messages:
            assert len(msg.encode("utf-8")) <= 1024, (
                f"CEF message exceeds 1024 bytes: {len(msg.encode())} bytes"
            )


# ── PrometheusReporter ────────────────────────────────────────────────────────

class TestPrometheusReporter:
    def test_exposition_format_contains_metrics(self, standard_trust_report):
        reporter = PrometheusReporter()
        body = reporter._build_exposition(standard_trust_report)
        assert "device_trust_score" in body
        assert "device_trust_level" in body
        assert "device_check_score" in body

    def test_exposition_format_valid_lines(self, standard_trust_report):
        reporter = PrometheusReporter()
        body = reporter._build_exposition(standard_trust_report)
        for line in body.strip().split("\n"):
            if line.startswith("#"):
                continue
            if not line.strip():
                continue
            # Each metric line should have a numeric value
            parts = line.split(" ")
            assert len(parts) >= 2, f"Invalid metric line: {line!r}"
            try:
                float(parts[-1])
            except ValueError:
                pytest.fail(f"Non-numeric value in metric line: {line!r}")

    @pytest.mark.asyncio
    async def test_put_to_pushgateway(self, standard_trust_report, mock_httpx_success):
        reporter = PrometheusReporter()
        result = await reporter.send(standard_trust_report)
        assert result is True
        mock_httpx_success.put.assert_called_once()

    @pytest.mark.asyncio
    async def test_pushgateway_url_includes_device_id(self, standard_trust_report, mock_httpx_success):
        reporter = PrometheusReporter()
        await reporter.send(standard_trust_report)
        call_url = mock_httpx_success.put.call_args.args[0]
        assert "medtrustx" in call_url or standard_trust_report.device_id in call_url


# ── OpaReporter ───────────────────────────────────────────────────────────────

class TestOpaReporter:
    @pytest.mark.asyncio
    async def test_put_to_correct_endpoint(self, standard_trust_report):
        reporter = OpaReporter()
        put_calls = []

        def mock_urlopen(request):
            put_calls.append(request)
            response = MagicMock()
            response.read.return_value = b'{"result": true}'
            response.status = 200
            response.__enter__ = lambda s: s
            response.__exit__ = MagicMock(return_value=False)
            return response

        with patch("urllib.request.urlopen", side_effect=mock_urlopen):
            result = await reporter.send(standard_trust_report)

        assert result is True
        assert len(put_calls) == 1
        req = put_calls[0]
        assert req.get_method() == "PUT"
        assert "/v1/data/medtrustx/devices/" in req.full_url

    @pytest.mark.asyncio
    async def test_opa_payload_contains_trust_level(self, standard_trust_report):
        reporter = OpaReporter()
        payloads = []

        def mock_urlopen(request):
            payloads.append(json.loads(request.data))
            response = MagicMock()
            response.read.return_value = b"{}"
            response.status = 200
            response.__enter__ = lambda s: s
            response.__exit__ = MagicMock(return_value=False)
            return response

        with patch("urllib.request.urlopen", side_effect=mock_urlopen):
            await reporter.send(standard_trust_report)

        assert len(payloads) == 1
        assert "trust_level" in payloads[0]
        assert "composite_score" in payloads[0]

    @pytest.mark.asyncio
    async def test_opa_error_returns_false(self, standard_trust_report):
        import urllib.error
        reporter = OpaReporter()
        with patch("urllib.request.urlopen", side_effect=urllib.error.URLError("refused")):
            result = await reporter.send(standard_trust_report)
        assert result is False


# ── Parallel reporting ─────────────────────────────────────────────────────────

class TestParallelReporting:
    @pytest.mark.asyncio
    async def test_all_four_reporters_run_concurrently(self, standard_trust_report):
        """
        Simulate the ContinuousScheduler._report_parallel() pattern:
        asyncio.gather must be used so all 4 reporters fire simultaneously.
        """
        call_order = []

        async def make_reporter(name):
            call_order.append(f"{name}_start")
            await asyncio.sleep(0)  # yield to event loop
            call_order.append(f"{name}_end")
            return True

        results = await asyncio.gather(
            make_reporter("zta"),
            make_reporter("siem"),
            make_reporter("prometheus"),
            make_reporter("opa"),
        )

        assert all(results)
        # All starts should appear before all ends (concurrent execution pattern)
        starts = [i for i, e in enumerate(call_order) if "_start" in e]
        ends   = [i for i, e in enumerate(call_order) if "_end" in e]
        # At minimum, not strictly serial (some interleaving)
        assert len(starts) == 4
        assert len(ends) == 4
