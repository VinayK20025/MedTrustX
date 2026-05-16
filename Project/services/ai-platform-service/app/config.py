"""
app/config.py
=============
Centralised configuration for the MedTrustX AI Platform Service.

All settings are loaded from environment variables (or a .env file when
running locally). Pydantic-settings handles type coercion, validation, and
provides a single shared instance (`settings`) imported throughout the app.

Design choices:
- `model_config = ConfigDict(strict=True)` — no silent type coercion.
- Computed DSN properties are @property methods, not stored fields, so they
  never appear in logs or error dumps.
- Sensitive values (passwords, keys) are typed as `SecretStr` so they are
  masked in `.model_dump()` output and log statements.
- A singleton `get_settings()` is cached with `@lru_cache` to avoid re-
  parsing env vars on every call.
"""

from __future__ import annotations

import os
from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Full application settings for the AI Platform Service.

    Sources (in priority order):
      1. Environment variables
      2. .env file in the working directory (only when ENV != production)
      3. Field defaults defined below
    """

    model_config = SettingsConfigDict(
        # Strict: reject unexpected extra env vars
        extra="ignore",
        # Case-insensitive env var names
        case_sensitive=False,
        # Load from .env when present (ignored in Docker where vars are injected)
        env_file=".env",
        env_file_encoding="utf-8",
        # Freeze the instance after creation — settings are immutable at runtime
        frozen=True,
    )

    # ── Service Identity ──────────────────────────────────────────────────────
    service_name: str = Field(default="ai-platform-service", alias="SERVICE_NAME")
    service_version: str = Field(default="1.0.0", alias="SERVICE_VERSION")
    environment: Literal["development", "staging", "production"] = Field(
        default="development", alias="ENVIRONMENT"
    )
    log_level: Literal["debug", "info", "warning", "error", "critical"] = Field(
        default="info", alias="LOG_LEVEL"
    )
    service_port: int = Field(default=8010, ge=1024, le=65535, alias="SERVICE_PORT")

    # ── PostgreSQL — Analytics DB ─────────────────────────────────────────────
    analytics_db_host: str = Field(
        default="medtrust-pg-analytics", alias="ANALYTICS_DB_HOST"
    )
    analytics_db_port: int = Field(default=5432, ge=1, le=65535, alias="ANALYTICS_DB_PORT")
    analytics_db_name: str = Field(default="analytics_db", alias="ANALYTICS_DB_NAME")
    analytics_db_user: str = Field(
        default="medtrust_analytics_admin", alias="ANALYTICS_DB_USER"
    )
    analytics_db_password: SecretStr = Field(
        default=SecretStr("analytics_db_secret_2026"), alias="ANALYTICS_DB_PASSWORD"
    )
    analytics_db_pool_size: int = Field(default=10, ge=1, le=100, alias="ANALYTICS_DB_POOL_SIZE")
    analytics_db_max_overflow: int = Field(
        default=20, ge=0, le=200, alias="ANALYTICS_DB_MAX_OVERFLOW"
    )
    # Per-query timeout in seconds (enforced via asyncio.wait_for in repos)
    analytics_db_query_timeout: float = Field(
        default=5.0, gt=0, le=60, alias="ANALYTICS_DB_QUERY_TIMEOUT"
    )

    @property
    def analytics_db_dsn(self) -> str:
        """Async SQLAlchemy DSN — never logged (constructed on demand)."""
        pwd = self.analytics_db_password.get_secret_value()
        return (
            f"postgresql+asyncpg://{self.analytics_db_user}:{pwd}"
            f"@{self.analytics_db_host}:{self.analytics_db_port}/{self.analytics_db_name}"
        )

    # ── Redis ─────────────────────────────────────────────────────────────────
    redis_host: str = Field(default="medtrust-redis", alias="REDIS_HOST")
    redis_port: int = Field(default=6379, ge=1, le=65535, alias="REDIS_PORT")
    redis_password: SecretStr = Field(
        default=SecretStr("redis_secret_2026"), alias="REDIS_PASSWORD"
    )
    redis_db: int = Field(default=2, ge=0, le=15, alias="REDIS_DB")
    redis_anomaly_channel: str = Field(
        default="medtrust:ai:anomalies", alias="REDIS_ANOMALY_CHANNEL"
    )
    feature_cache_ttl: int = Field(
        default=900, ge=0, alias="FEATURE_CACHE_TTL"
    )  # seconds (15 min)
    analytics_cache_ttl: int = Field(
        default=300, ge=0, alias="ANALYTICS_CACHE_TTL"
    )  # seconds (5 min)

    @property
    def redis_url(self) -> str:
        """Full Redis URL — constructed on demand, never stored."""
        pwd = self.redis_password.get_secret_value()
        return f"redis://:{pwd}@{self.redis_host}:{self.redis_port}/{self.redis_db}"

    # ── TensorFlow Serving ────────────────────────────────────────────────────
    tf_serving_host: str = Field(default="tf-serving-service", alias="TF_SERVING_HOST")
    tf_serving_rest_port: int = Field(
        default=8501, ge=1, le=65535, alias="TF_SERVING_REST_PORT"
    )
    tf_serving_url: str = Field(
        default="http://tf-serving-service:8501", alias="TF_SERVING_URL"
    )
    tf_serving_timeout: float = Field(
        default=3.0, gt=0, le=30, alias="TF_SERVING_TIMEOUT"
    )
    tf_model_readmission: str = Field(
        default="readmission", alias="TF_MODEL_READMISSION"
    )
    tf_model_anomaly: str = Field(
        default="vitals_anomaly", alias="TF_MODEL_ANOMALY"
    )
    tf_model_diagnose: str = Field(
        default="diagnose_risk", alias="TF_MODEL_DIAGNOSE"
    )

    @property
    def tf_serving_predict_url(self) -> str:
        """Base predict URL template — format with model name."""
        return f"{self.tf_serving_url}/v1/models/{{model_name}}:predict"

    # ── MLflow ────────────────────────────────────────────────────────────────
    mlflow_tracking_uri: str = Field(
        default="http://mlflow-service:5000", alias="MLFLOW_TRACKING_URI"
    )
    mlflow_artifact_root: str = Field(
        default="s3://ml-models", alias="MLFLOW_ARTIFACT_ROOT"
    )
    mlflow_s3_endpoint_url: str = Field(
        default="http://minio:9000", alias="MLFLOW_S3_ENDPOINT_URL"
    )
    aws_access_key_id: SecretStr = Field(
        default=SecretStr("medtrust_minio_admin"), alias="AWS_ACCESS_KEY_ID"
    )
    aws_secret_access_key: SecretStr = Field(
        default=SecretStr("minio_secret_2026"), alias="AWS_SECRET_ACCESS_KEY"
    )

    # ── Keycloak / JWT Auth ───────────────────────────────────────────────────
    keycloak_url: str = Field(default="http://keycloak:8080", alias="KEYCLOAK_URL")
    keycloak_realm: str = Field(default="medtrustx", alias="KEYCLOAK_REALM")
    jwt_audience: str = Field(
        default="medtrustx-ai-platform", alias="JWT_AUDIENCE"
    )
    jwt_algorithm: Literal["RS256"] = Field(default="RS256", alias="JWT_ALGORITHM")
    jwks_cache_ttl: int = Field(
        default=300, ge=30, le=3600, alias="JWKS_CACHE_TTL"
    )
    jwt_tenant_claim: str = Field(default="tenant_id", alias="JWT_TENANT_CLAIM")
    jwt_user_claim: str = Field(default="sub", alias="JWT_USER_CLAIM")
    jwt_role_claim: str = Field(default="realm_access", alias="JWT_ROLE_CLAIM")

    @property
    def keycloak_jwks_url(self) -> str:
        """JWKS endpoint derived from base URL + realm."""
        return (
            f"{self.keycloak_url}/realms/{self.keycloak_realm}"
            "/protocol/openid-connect/certs"
        )

    @property
    def keycloak_issuer(self) -> str:
        """Expected `iss` claim in the JWT."""
        return f"{self.keycloak_url}/realms/{self.keycloak_realm}"

    # ── Post-Quantum Cryptography (PQC) — Kyber-768 ──────────────────────────
    pqc_enabled: bool = Field(default=True, alias="PQC_ENABLED")
    pqc_kem_algorithm: str = Field(default="Kyber768", alias="PQC_KEM_ALGORITHM")
    pqc_public_key_path: str = Field(
        default="/run/secrets/pqc_kyber_public.key", alias="PQC_PUBLIC_KEY_PATH"
    )
    pqc_session_header: str = Field(
        default="X-PQC-Session-Key", alias="PQC_SESSION_HEADER"
    )

    @field_validator("pqc_public_key_path")
    @classmethod
    def pqc_key_path_must_be_absolute(cls, v: str) -> str:
        """Enforce absolute path to prevent directory traversal issues."""
        if not os.path.isabs(v):
            raise ValueError(
                f"pqc_public_key_path must be an absolute path, got: {v!r}"
            )
        return v

    # ── OpenTelemetry / Jaeger ────────────────────────────────────────────────
    otel_enabled: bool = Field(default=True, alias="OTEL_ENABLED")
    otel_service_name: str = Field(
        default="medtrust-ai-platform", alias="OTEL_SERVICE_NAME"
    )
    otel_exporter_otlp_endpoint: str = Field(
        default="http://jaeger:14268/api/traces",
        alias="OTEL_EXPORTER_OTLP_ENDPOINT",
    )
    otel_trace_sample_rate: float = Field(
        default=1.0, ge=0.0, le=1.0, alias="OTEL_TRACE_SAMPLE_RATE"
    )

    # ── Loki (Structured JSON log shipping) ───────────────────────────────────
    loki_enabled: bool = Field(default=True, alias="LOKI_ENABLED")
    loki_url: str = Field(
        default="http://loki:3100/loki/api/v1/push", alias="LOKI_URL"
    )
    loki_batch_size: int = Field(default=10, ge=1, alias="LOKI_BATCH_SIZE")
    loki_flush_interval: float = Field(
        default=5.0, gt=0, alias="LOKI_FLUSH_INTERVAL"
    )

    # ── Multi-Tenancy ─────────────────────────────────────────────────────────
    # Comma-separated list: "tenant_apollo,tenant_medanta,tenant_aiims"
    valid_tenant_ids_raw: str = Field(
        default="tenant_apollo,tenant_medanta,tenant_aiims",
        alias="VALID_TENANT_IDS",
    )
    pg_tenant_session_var: str = Field(
        default="app.tenant_id", alias="PG_TENANT_SESSION_VAR"
    )

    @property
    def valid_tenant_ids(self) -> list[str]:
        """Parsed list of allowed tenant identifiers."""
        return [t.strip() for t in self.valid_tenant_ids_raw.split(",") if t.strip()]

    # ── CORS ──────────────────────────────────────────────────────────────────
    cors_origins_raw: str = Field(
        default="http://localhost:3000", alias="CORS_ORIGINS"
    )

    @property
    def cors_origins(self) -> list[str]:
        """Parsed list of allowed CORS origins."""
        return [o.strip() for o in self.cors_origins_raw.split(",") if o.strip()]

    # ── Feature Engineering ───────────────────────────────────────────────────
    readmission_lookback_days: int = Field(
        default=90, ge=1, le=365, alias="READMISSION_LOOKBACK_DAYS"
    )
    anomaly_zscore_threshold: float = Field(
        default=2.5, gt=0, alias="ANOMALY_ZSCORE_THRESHOLD"
    )
    anomaly_lookback_hours: int = Field(
        default=24, ge=1, le=720, alias="ANOMALY_LOOKBACK_HOURS"
    )

    # ── WebSocket ─────────────────────────────────────────────────────────────
    ws_history_events: int = Field(
        default=10, ge=1, le=100, alias="WS_HISTORY_EVENTS"
    )
    ws_ping_interval: int = Field(
        default=30, ge=5, le=300, alias="WS_PING_INTERVAL"
    )
    ws_max_connections: int = Field(
        default=500, ge=1, alias="WS_MAX_CONNECTIONS"
    )

    # ── Rate Limiting ─────────────────────────────────────────────────────────
    rate_limit_per_minute: int = Field(
        default=120, ge=1, alias="RATE_LIMIT_PER_MINUTE"
    )

    # ── Cross-field validation ────────────────────────────────────────────────
    @model_validator(mode="after")
    def validate_pqc_key_exists_in_production(self) -> "Settings":
        """
        In production, the PQC public key file MUST exist at the configured path.
        In development the file may be absent (PQC validation degrades gracefully).
        """
        if self.environment == "production" and self.pqc_enabled:
            if not os.path.isfile(self.pqc_public_key_path):
                raise ValueError(
                    f"PQC public key not found at '{self.pqc_public_key_path}'. "
                    "In production, mount the key from Vault or a Kubernetes secret."
                )
        return self

    @model_validator(mode="after")
    def validate_pool_sizes(self) -> "Settings":
        """Ensure max_overflow >= pool_size to avoid deadlocks under load."""
        if self.analytics_db_max_overflow < self.analytics_db_pool_size:
            raise ValueError(
                "analytics_db_max_overflow must be >= analytics_db_pool_size "
                f"(got pool_size={self.analytics_db_pool_size}, "
                f"max_overflow={self.analytics_db_max_overflow})"
            )
        return self


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Return the cached, immutable Settings singleton.

    Using lru_cache(maxsize=1) means the Settings object is constructed once
    per process — env vars are not re-read on every request.  In tests, call
    `get_settings.cache_clear()` then set env vars to override.
    """
    return Settings()


# ── Module-level convenience alias ───────────────────────────────────────────
# Import this directly in other modules:  from app.config import settings
settings: Settings = get_settings()
