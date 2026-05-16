"""
MedTrustX DB Extraction Engine — Configuration
"""
from pydantic_settings import BaseSettings
from typing import Dict

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "debug"
    SERVICE_NAME: str = "db-extraction-engine"
    SERVICE_VERSION: str = "1.0.0"

    # Extraction Engine's own DB (derived tables, snapshots)
    DB_HOST: str = "pg-analytics"
    DB_PORT: int = 5432
    DB_USER: str = "extraction_svc"
    DB_PASSWORD: str = "extraction_svc_secret"
    DB_NAME: str = "extraction_db"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Service DB connectors (read-only replicas)
    PATIENT_DB_URL: str = "postgresql+asyncpg://readonly:secret@pg-clinical:5432/patient_db"
    CLINICAL_DB_URL: str = "postgresql+asyncpg://readonly:secret@pg-clinical:5432/clinical_db"
    ICU_DB_URL: str = "postgresql+asyncpg://readonly:secret@pg-clinical:5432/icu_db"
    BILLING_DB_URL: str = "postgresql+asyncpg://readonly:secret@pg-operational:5432/billing_db"
    PHARMACY_DB_URL: str = "postgresql+asyncpg://readonly:secret@pg-clinical:5432/pharmacy_db"

    REDIS_URL: str = "redis://redis:6379/200"
    KAFKA_BROKERS: str = "redpanda:9092"
    OPA_URL: str = "http://opa:8181"
    OTEL_EXPORTER_OTLP_ENDPOINT: str = "http://jaeger:4317"
    CACHE_TTL_SECONDS: int = 300

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
