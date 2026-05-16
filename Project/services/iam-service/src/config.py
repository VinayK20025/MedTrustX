"""
MedTrustX IAM Service — Configuration
Cluster: pg-operational (port 5432)
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "debug"
    SERVICE_NAME: str = "iam-service"
    SERVICE_VERSION: str = "1.0.0"

    DB_HOST: str = "pg-operational"
    DB_PORT: int = 5432
    DB_USER: str = "iam_svc"
    DB_PASSWORD: str = "iam_svc_secret"
    DB_NAME: str = "iam_db"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def DATABASE_URL_SYNC(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    REDIS_URL: str = "redis://redis:6379/23"
    KAFKA_BROKERS: str = "redpanda:9092"
    KEYCLOAK_URL: str = "http://keycloak:8080"
    OPA_URL: str = "http://opa:8181"
    VAULT_ADDR: str = "http://vault:8200"
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://jaeger:4317"
    TENANT_IDS: str = "tenant_apollo,tenant_medanta,tenant_aiims"
    DEFAULT_TENANT_ID: str = "tenant_apollo"
    METRICS_ENABLED: bool = True
    
    JWT_SECRET: str = "super_secret_jwt_key_for_development_only"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
