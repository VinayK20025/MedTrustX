"""
MedTrustX Emergency Break-Glass Access Service — Configuration
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "debug"
    SERVICE_NAME: str = "break-glass-service"
    SERVICE_VERSION: str = "1.0.0"

    DB_HOST: str = "pg-security"
    DB_PORT: int = 5432
    DB_USER: str = "breakglass_svc"
    DB_PASSWORD: str = "breakglass_svc_secret"
    DB_NAME: str = "breakglass_db"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    REDIS_URL: str = "redis://redis:6379/250"
    KAFKA_BROKERS: str = "redpanda:9092"
    OPA_URL: str = "http://opa:8181"
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://jaeger:4317"

    # Break-glass specific
    DEFAULT_SESSION_DURATION_MINUTES: int = 30
    MAX_SESSION_DURATION_MINUTES: int = 120
    AUTO_APPROVE_CLINICAL_EMERGENCY: bool = True
    REQUIRE_MFA: bool = True
    DUAL_APPROVAL_FOR_HIGH_RISK: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
