"""
MedTrustX TF Serving Service — Configuration
Cluster: pg-operational (port 5432)
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "debug"
    SERVICE_NAME: str = "tf-serving-service"
    SERVICE_VERSION: str = "1.0.0"

    DB_HOST: str = "pg-operational"
    DB_PORT: int = 5432
    DB_USER: str = "tfserving_svc"
    DB_PASSWORD: str = "tfserving_svc_secret"
    DB_NAME: str = "tfserving_db"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def DATABASE_URL_SYNC(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    REDIS_URL: str = "redis://redis:6379/44"
    KAFKA_BROKERS: str = "redpanda:9092"
    OPA_URL: str = "http://opa:8181"
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://jaeger:4317"
    MODEL_BASE_PATH: str = "/models"
    ARTIFACT_STORE: str = "s3://medtrust-model-artifacts"
    TENANT_IDS: str = "tenant_apollo,tenant_medanta,tenant_aiims"
    DEFAULT_TENANT_ID: str = "tenant_apollo"
    METRICS_ENABLED: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
