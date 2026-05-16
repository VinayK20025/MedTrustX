"""
MedTrustX Device Trust Agent — pytest Configuration and Shared Fixtures.

Provides:
  - Environment setup for all tests (mocked config, loopback-only bind host)
  - Factory fixtures for CheckResult, TrustReport, and AccessPolicy
  - Async event-loop configuration for pytest-asyncio
  - Shared mocks for external dependencies (DB, HTTP, subprocess)
"""

from __future__ import annotations

import asyncio
import os
import socket
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── Environment setup (must run before any src import) ───────────────────────

# These env vars satisfy AgentConfig validators before any test imports src.
os.environ.setdefault("AGENT_DEVICE_ID",            str(uuid.uuid4()))
os.environ.setdefault("AGENT_TENANT_ID",            str(uuid.uuid4()))
os.environ.setdefault("ZTA_SERVICE_URL",            "https://zta.test.local")
os.environ.setdefault("ZTA_JWT_SECRET",             "test-secret-minimum-32-chars-!!!")
os.environ.setdefault("SIEM_HOST",                  "127.0.0.1")
os.environ.setdefault("SIEM_PORT",                  "514")
os.environ.setdefault("PROMETHEUS_PUSHGATEWAY_URL", "http://127.0.0.1:9091")
os.environ.setdefault("OPA_SERVICE_URL",            "http://127.0.0.1:8181")
os.environ.setdefault("ON_DEMAND_BIND_HOST",        "127.0.0.1")
os.environ.setdefault("ON_DEMAND_BIND_PORT",        "9099")
os.environ.setdefault("IAM_DB_HOST",                "localhost")
os.environ.setdefault("IAM_DB_NAME",                "iam_db")
os.environ.setdefault("IAM_DB_USER",                "iam_reader")
os.environ.setdefault("IAM_DB_PASSWORD",            "test-password")


# ── pytest-asyncio configuration ─────────────────────────────────────────────

@pytest.fixture(scope="session")
def event_loop_policy():
    """Use the default asyncio event loop policy for the test session."""
    return asyncio.DefaultEventLoopPolicy()


# ── Weight constants (mirrors weight_config.py) ───────────────────────────────

WEIGHTS: Dict[int, float] = {
    1: 0.15,
    2: 0.15,
    3: 0.10,
    4: 0.08,
    5: 0.10,
    6: 0.12,
    7: 0.10,
    8: 0.08,
    9: 0.07,
    10: 0.05,
}

CHECK_NAMES: Dict[int, str] = {
    1:  "os_patch",
    2:  "antivirus",
    3:  "disk_encryption",
    4:  "firewall",
    5:  "screen_lock",
    6:  "jailbreak",
    7:  "certificate",
    8:  "network",
    9:  "processes",
    10: "behavioral",
}

IMMEDIATE_BLOCK_IDS = frozenset({6, 7, 9})


# ── CheckResult factory ───────────────────────────────────────────────────────

@pytest.fixture
def make_check_result():
    """Return a factory for CheckResult instances."""
    from src.models.check_result import CheckResult

    def _factory(
        check_id: int = 1,
        score: float = 8.0,
        passed: Optional[bool] = None,
        immediate_block: bool = False,
        details: Optional[str] = None,
        duration_ms: float = 50.0,
    ) -> CheckResult:
        weight = WEIGHTS.get(check_id, 0.10)
        if passed is None:
            passed = score >= 6.0
        return CheckResult(
            check_id=check_id,
            check_name=CHECK_NAMES.get(check_id, f"check_{check_id:02d}"),
            score=score,
            weight=weight,
            passed=passed,
            immediate_block=immediate_block,
            details=details or f"check_{check_id} result",
            duration_ms=duration_ms,
        )

    return _factory


@pytest.fixture
def all_passing_results(make_check_result) -> List:
    """All 10 checks with score=9.0 (no blocks)."""
    from src.models.check_result import CheckResult
    return [make_check_result(check_id=i, score=9.0) for i in range(1, 11)]


@pytest.fixture
def all_failing_results(make_check_result) -> List:
    """All 10 checks with score=2.0."""
    return [make_check_result(check_id=i, score=2.0) for i in range(1, 11)]


@pytest.fixture
def critical_block_result(make_check_result):
    """Check 6 (jailbreak) with score=1 and immediate_block=True."""
    return make_check_result(check_id=6, score=1.0, immediate_block=True)


# ── TrustReport factory ───────────────────────────────────────────────────────

@pytest.fixture
def make_trust_report(make_check_result):
    """Return a factory for TrustReport instances."""
    from src.models.trust_level import TrustLevel
    from src.models.trust_report import AccessPolicy, TrustReport

    def _factory(
        check_results=None,
        composite_score: float = 8.0,
        trust_level: TrustLevel = TrustLevel.STANDARD,
        device_id: Optional[str] = None,
        tenant_id: Optional[str] = None,
        override_applied: bool = False,
        override_reason: Optional[str] = None,
    ) -> TrustReport:
        if check_results is None:
            check_results = [make_check_result(check_id=i, score=8.0) for i in range(1, 11)]

        access_policy = AccessPolicy.from_trust_level(trust_level)

        return TrustReport(
            device_id=device_id or os.environ["AGENT_DEVICE_ID"],
            tenant_id=tenant_id or os.environ["AGENT_TENANT_ID"],
            platform="linux",
            agent_mode="native",
            agent_version="1.0.0-test",
            timestamp=datetime(2024, 1, 15, 12, 0, 0, tzinfo=timezone.utc),
            check_results=check_results,
            composite_score=composite_score,
            trust_level=trust_level,
            override_applied=override_applied,
            override_reason=override_reason,
            access_policy=access_policy,
            next_check_in=60,
        )

    return _factory


@pytest.fixture
def standard_trust_report(make_trust_report):
    """A TrustReport at STANDARD tier with composite score 7.5."""
    from src.models.trust_level import TrustLevel
    return make_trust_report(composite_score=7.5, trust_level=TrustLevel.STANDARD)


@pytest.fixture
def blocked_trust_report(make_trust_report, make_check_result):
    """A TrustReport at BLOCKED tier (check 6 immediate block)."""
    from src.models.trust_level import TrustLevel
    results = [make_check_result(check_id=i, score=8.0) for i in range(1, 11)]
    results[5] = make_check_result(check_id=6, score=1.0, immediate_block=True)
    return make_trust_report(
        check_results=results,
        composite_score=0.0,
        trust_level=TrustLevel.BLOCKED,
        override_applied=True,
        override_reason="immediate_block: check_06_jailbreak",
    )


@pytest.fixture
def trusted_trust_report(make_trust_report):
    """A TrustReport at TRUSTED tier with composite score 9.0."""
    from src.models.trust_level import TrustLevel
    return make_trust_report(composite_score=9.0, trust_level=TrustLevel.TRUSTED)


# ── Mock subprocess helper ────────────────────────────────────────────────────

@pytest.fixture
def mock_subprocess_run():
    """Patch subprocess.run to return configurable stdout/returncode."""
    def _factory(stdout: str = "", returncode: int = 0, stderr: str = ""):
        mock = MagicMock()
        mock.stdout = stdout
        mock.stderr = stderr
        mock.returncode = returncode
        return mock

    with patch("subprocess.run") as patched:
        patched.side_effect = None
        patched.return_value = _factory()
        yield patched, _factory


# ── Mock asyncio subprocess helper ────────────────────────────────────────────

class _AsyncProcessMock:
    """Minimal mock for asyncio.create_subprocess_exec."""

    def __init__(self, stdout: bytes = b"", stderr: bytes = b"", returncode: int = 0):
        self._stdout = stdout
        self._stderr = stderr
        self.returncode = returncode

    async def communicate(self):
        return self._stdout, self._stderr

    async def wait(self):
        return self.returncode


@pytest.fixture
def mock_async_subprocess():
    """Patch asyncio.create_subprocess_exec."""
    def _factory(stdout: bytes = b"", stderr: bytes = b"", returncode: int = 0):
        return _AsyncProcessMock(stdout, stderr, returncode)

    with patch("asyncio.create_subprocess_exec") as patched:
        patched.return_value = _factory()
        yield patched, _factory


# ── Mock psutil ───────────────────────────────────────────────────────────────

@pytest.fixture
def mock_psutil_no_malware():
    """Patch psutil.process_iter to return benign processes."""
    proc = MagicMock()
    proc.info = {"name": "python3", "pid": 12345, "cpu_percent": 0.5}
    with patch("psutil.process_iter", return_value=[proc]):
        yield


@pytest.fixture
def mock_psutil_with_malware():
    """Patch psutil.process_iter to include a mimikatz process."""
    benign = MagicMock()
    benign.info = {"name": "python3", "pid": 12345, "cpu_percent": 0.5}

    malware = MagicMock()
    malware.info = {"name": "mimikatz.exe", "pid": 9999, "cpu_percent": 10.0}

    with patch("psutil.process_iter", return_value=[benign, malware]):
        yield


# ── Mock httpx AsyncClient ────────────────────────────────────────────────────

@pytest.fixture
def mock_httpx_success():
    """Patch httpx.AsyncClient to return HTTP 200."""
    response = MagicMock()
    response.status_code = 200
    response.raise_for_status = MagicMock()
    response.json = MagicMock(return_value={"status": "ok"})

    client = AsyncMock()
    client.__aenter__ = AsyncMock(return_value=client)
    client.__aexit__ = AsyncMock(return_value=False)
    client.post = AsyncMock(return_value=response)
    client.put  = AsyncMock(return_value=response)
    client.get  = AsyncMock(return_value=response)

    with patch("httpx.AsyncClient", return_value=client):
        yield client


@pytest.fixture
def mock_httpx_failure():
    """Patch httpx.AsyncClient to raise httpx.HTTPError."""
    import httpx

    client = AsyncMock()
    client.__aenter__ = AsyncMock(return_value=client)
    client.__aexit__ = AsyncMock(return_value=False)
    client.post = AsyncMock(side_effect=httpx.ConnectError("connection refused"))

    with patch("httpx.AsyncClient", return_value=client):
        yield client


# ── Mock psycopg2 DB ──────────────────────────────────────────────────────────

@pytest.fixture
def mock_db_clean():
    """Patch psycopg2.connect to return an empty auth_logs result."""
    conn = MagicMock()
    cursor = MagicMock()
    cursor.fetchall.return_value = []
    cursor.fetchone.return_value = (0,)
    conn.cursor.return_value.__enter__ = MagicMock(return_value=cursor)
    conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    with patch("psycopg2.connect", return_value=conn):
        yield conn, cursor


@pytest.fixture
def mock_db_unreachable():
    """Patch psycopg2.connect to raise OperationalError."""
    import psycopg2

    with patch("psycopg2.connect", side_effect=psycopg2.OperationalError("connection refused")):
        yield


# ── Free port helper ──────────────────────────────────────────────────────────

@pytest.fixture
def free_port() -> int:
    """Return a free TCP port on 127.0.0.1."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


# ── Platform environment helpers ──────────────────────────────────────────────

@pytest.fixture
def mock_linux(monkeypatch):
    """Force platform detection to Linux."""
    monkeypatch.setattr("sys.platform", "linux")
    monkeypatch.setenv("MEDTRUSTX_MOBILE_PLATFORM", "")


@pytest.fixture
def mock_macos(monkeypatch):
    """Force platform detection to macOS."""
    monkeypatch.setattr("sys.platform", "darwin")
    monkeypatch.setenv("MEDTRUSTX_MOBILE_PLATFORM", "")


@pytest.fixture
def mock_windows(monkeypatch):
    """Force platform detection to Windows."""
    monkeypatch.setattr("sys.platform", "win32")
    monkeypatch.setenv("MEDTRUSTX_MOBILE_PLATFORM", "")
