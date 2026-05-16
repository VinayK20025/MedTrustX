"""
MedTrustX Bed Management Service — Configuration

All settings are loaded from environment variables (injected by Docker Compose).
Pydantic Settings validates types and provides defaults for local development.

Cluster: pg-operational (port 5433)
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Application ─────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "debug"
    SERVICE_NAME: str = "bed-management-service"
    SERVICE_VERSION: str = "1.0.0"

    # ── Database (pg-operational) ───────────────────────────────
    DB_HOST: str = "pg-operational"
    DB_PORT: int = 5432
    DB_USER: str = "bed_mgmt_svc"
    DB_PASSWORD: str = "bed_mgmt_svc_secret"
    DB_NAME: str = "bed_mgmt_db"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def DATABASE_URL_SYNC(self) -> str:
        """Synchronous URL for Alembic migrations."""
        return (
            f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    # ── Redis ───────────────────────────────────────────────────
    REDIS_URL: str = "redis://redis:6379/13"

    # ── Kafka / Redpanda ────────────────────────────────────────
    KAFKA_BROKERS: str = "redpanda:9092"

    # ── Auth & Security ─────────────────────────────────────────
    KEYCLOAK_URL: str = "http://keycloak:8080"
    OPA_URL: str = "http://opa:8181"
    VAULT_ADDR: str = "http://vault:8200"

    # ── Observability ───────────────────────────────────────────
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://jaeger:4317"

    # ── Multi-Tenancy ───────────────────────────────────────────
    TENANT_IDS: str = "tenant_apollo,tenant_medanta,tenant_aiims"
    DEFAULT_TENANT_ID: str = "tenant_apollo"

    # ── Prometheus Metrics ──────────────────────────────────────
    METRICS_ENABLED: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
