"""
tests/conftest.py
==================
Pytest configuration and shared fixtures for the MedTrustX AI Platform Service.

Integration test strategy:
  - Real DB connection to analytics_db (medtrust-pg-analytics, port 5435).
  - Real Redis connection.
  - TF Serving and MLflow calls are MOCKED via pytest-mock / respx.
  - Tests use a dedicated tenant "tenant_test" with SET LOCAL isolation.
  - A real patient_id is fetched from the seeded readmission_risk table.

Environment:
  Tests read from .env or environment variables.  For CI, set:
    ANALYTICS_DB_HOST=localhost
    ANALYTICS_DB_PORT=5435
    REDIS_HOST=localhost
    REDIS_PORT=6379
    PQC_ENABLED=false   ← disables PQC key file requirement in tests
"""

from __future__ import annotations

import asyncio
import os
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

# ── Force test environment BEFORE importing app modules ─────────────────────
os.environ.setdefault("ENVIRONMENT", "development")
os.environ.setdefault("ANALYTICS_DB_HOST", os.getenv("ANALYTICS_DB_HOST", "localhost"))
os.environ.setdefault("ANALYTICS_DB_PORT", "5435")
os.environ.setdefault("ANALYTICS_DB_NAME", "analytics_db")
os.environ.setdefault("ANALYTICS_DB_USER", "medtrust_analytics_admin")
os.environ.setdefault("ANALYTICS_DB_PASSWORD", "analytics_db_secret_2026")
os.environ.setdefault("REDIS_HOST", os.getenv("REDIS_HOST", "localhost"))
os.environ.setdefault("REDIS_PORT", "6379")
os.environ.setdefault("REDIS_PASSWORD", "redis_secret_2026")
os.environ.setdefault("PQC_ENABLED", "false")
os.environ.setdefault("OTEL_ENABLED", "false")
os.environ.setdefault("LOKI_ENABLED", "false")
os.environ.setdefault("KEYCLOAK_URL", "http://localhost:8080")
os.environ.setdefault("MLFLOW_TRACKING_URI", "http://localhost:5000")
os.environ.setdefault("TF_SERVING_URL", "http://localhost:8501")


# ── Now import app modules ───────────────────────────────────────────────────
from app.config import get_settings, settings
from app.db.session import get_db_session
from app.db.repositories.risk import RiskRepository
from app.main import create_app


# ── Event loop ──────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def event_loop():
    """Single event loop for the entire test session."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


# ── Application fixture ──────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def test_app() -> FastAPI:
    """Return the FastAPI application configured for testing."""
    # Clear settings cache so test env vars are picked up
    get_settings.cache_clear()
    return create_app()


# ── Test tenant ──────────────────────────────────────────────────────────────

TEST_TENANT_ID = "tenant_apollo"


# ── Real patient_id from seeded data ─────────────────────────────────────────

@pytest_asyncio.fixture(scope="session")
async def real_patient_id() -> str:
    """
    Fetch a real patient_id from the seeded readmission_risk table.

    The analytics_db has 3,386 rows in readmission_risk — this picks one at
    random to use across inference tests.
    """
    async with get_db_session(TEST_TENANT_ID) as session:
        repo = RiskRepository(session)
        patient_id = await repo.get_sample_patient_id()

    if not patient_id:
        pytest.skip("No seeded data in readmission_risk — run seed_ai_engine.py first")

    return patient_id


# ── JWT mock ─────────────────────────────────────────────────────────────────

def _mock_jwt_claims(tenant_id: str = TEST_TENANT_ID) -> dict:
    return {
        "tenant_id": tenant_id,
        "user_id": "test-user-uuid",
        "roles": ["ai-user", "ml-engineer"],
        "payload": {
            "sub": "test-user-uuid",
            "tenant_id": tenant_id,
            "realm_access": {"roles": ["ai-user", "ml-engineer"]},
        },
    }


@pytest.fixture
def mock_auth(monkeypatch):
    """
    Bypass PQC+JWT validation for unit/integration tests.

    Patches the middleware to inject test claims into request.state directly.
    """
    async def _fake_validate(token: str, pqc_session_header=None):
        return _mock_jwt_claims()

    monkeypatch.setattr(
        "app.auth.pqc_jwt.validate_pqc_jwt",
        _fake_validate,
    )
    # Also patch the middleware's dispatch to set request.state directly
    from app.auth import middleware as mw

    original_dispatch = mw.PQCAuthMiddleware.dispatch

    async def _patched_dispatch(self, request, call_next):
        if not any(request.url.path.startswith(p) for p in mw._EXEMPT_PREFIXES):
            claims = _mock_jwt_claims()
            request.state.tenant_id = claims["tenant_id"]
            request.state.user_id = claims["user_id"]
            request.state.roles = claims["roles"]
            request.state.jwt_payload = claims["payload"]
        return await call_next(request)

    monkeypatch.setattr(mw.PQCAuthMiddleware, "dispatch", _patched_dispatch)


# ── HTTP test client ─────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def async_client(test_app: FastAPI, mock_auth) -> AsyncGenerator[AsyncClient, None]:
    """
    Async HTTP client for endpoint tests.

    The ``mock_auth`` fixture is applied so auth middleware is bypassed.
    """
    async with AsyncClient(
        transport=ASGITransport(app=test_app),
        base_url="http://test",
        headers={
            "Authorization": "Bearer test-token",
            "Content-Type": "application/json",
        },
    ) as client:
        yield client


# ── TF Serving mock ──────────────────────────────────────────────────────────

@pytest.fixture
def mock_tf_serving():
    """Mock TF Serving to return a fixed prediction score of 0.72."""
    with patch("app.services.tf_serving.call_tf_serving") as mock:
        mock.return_value = ([0.72], "tf_serving")
        yield mock


# ── MLflow mock ──────────────────────────────────────────────────────────────

@pytest.fixture
def mock_mlflow():
    """Mock MLflow client to return 'version-1' for all model queries."""
    with patch("app.services.mlflow_client.get_latest_model_version") as mock_ver:
        mock_ver.return_value = "1"
        with patch("app.services.mlflow_client.list_registered_models") as mock_list:
            mock_list.return_value = []
            with patch("app.services.mlflow_client.get_training_baseline") as mock_base:
                mock_base.return_value = None
                yield {"version": mock_ver, "list": mock_list, "baseline": mock_base}


# ── Redis mock ───────────────────────────────────────────────────────────────

@pytest.fixture
def mock_redis_cache():
    """Mock Redis to always return a cache miss (forces DB queries in tests)."""
    with patch("app.services.feature_store._get_redis") as mock:
        redis_instance = AsyncMock()
        redis_instance.get = AsyncMock(return_value=None)
        redis_instance.set = AsyncMock(return_value=True)
        redis_instance.aclose = AsyncMock()
        mock.return_value = redis_instance
        yield redis_instance


# ── SHAP mock ────────────────────────────────────────────────────────────────

@pytest.fixture
def mock_shap():
    """Mock SHAP computation to return uniform feature attributions."""
    with patch("app.services.explainability._compute_shap_values_sync") as mock:
        n_features = 11
        mock.return_value = ([0.05] * n_features, 0.45)
        yield mock
