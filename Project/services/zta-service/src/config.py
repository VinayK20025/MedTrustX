"""Service configuration from environment variables."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "debug"
    SERVICE_NAME: str = "zta-service"

    # Database
    DB_HOST: str = "pg-clinical"
    DB_PORT: int = 5432
    DB_USER: str = "patient_svc"
    DB_PASSWORD: str = "patient_svc_secret"
    DB_NAME: str = "patients_db"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # Kafka
    KAFKA_BROKERS: str = "redpanda:9092"

    # Auth
    KEYCLOAK_URL: str = "http://keycloak:8080"
    OPA_URL: str = "http://opa:8181"
    VAULT_ADDR: str = "http://vault:8200"

    # Observability
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://jaeger:4317"

    # Multi-tenancy
    TENANT_IDS: str = "tenant_apollo,tenant_medanta,tenant_aiims"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

