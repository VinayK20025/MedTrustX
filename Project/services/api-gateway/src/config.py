"""
MedTrustX Internal API Gateway — Configuration
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "debug"
    SERVICE_NAME: str = "api-gateway"
    SERVICE_VERSION: str = "1.0.0"

    DB_HOST: str = "pg-operational" # Storing gateway configs in operational DB
    DB_PORT: int = 5432
    DB_USER: str = "gateway_svc"
    DB_PASSWORD: str = "gateway_svc_secret"
    DB_NAME: str = "gateway_db"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    @property
    def DATABASE_URL_SYNC(self) -> str:
        return (
            f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    REDIS_URL: str = "redis://redis:6379/0" # DB 0 for gateway cache
    KAFKA_BROKERS: str = "redpanda:9092"
    KEYCLOAK_URL: str = "http://keycloak:8080"
    OPA_URL: str = "http://opa:8181"
    VAULT_ADDR: str = "http://vault:8200"
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://jaeger:4317"

    TENANT_IDS: str = "tenant_apollo,tenant_medanta,tenant_aiims"
    DEFAULT_TENANT_ID: str = "tenant_apollo"

    METRICS_ENABLED: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
