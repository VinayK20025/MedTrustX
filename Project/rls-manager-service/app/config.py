"""
Settings and configuration for RLS Manager Service.
"""

from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = Field(default="development", env="ENVIRONMENT")
    service_name: str = Field(default="rls-manager-service", env="SERVICE_NAME")
    service_version: str = Field(default="1.0.0", env="SERVICE_VERSION")
    service_port: int = Field(default=8011, env="SERVICE_PORT")

    # DB URLs
    clinical_db_url: str = Field(..., env="CLINICAL_DB_URL")
    operational_db_url: str = Field(..., env="OPERATIONAL_DB_URL")
    iam_db_url: str = Field(..., env="IAM_DB_URL")
    analytics_db_url: str = Field(..., env="ANALYTICS_DB_URL")

    # Redis
    redis_url: str = Field(..., env="REDIS_URL")

    # Keycloak / Auth
    keycloak_url: str = Field(default="http://keycloak:8080", env="KEYCLOAK_URL")
    keycloak_realm: str = Field(default="medtrustx", env="KEYCLOAK_REALM")
    pqc_enabled: bool = Field(default=True, env="PQC_ENABLED")
    pqc_kyber_public_key_path: str = Field(default="/run/secrets/pqc_kyber_public.key", env="PQC_KYBER_PUBLIC_KEY_PATH")
    pqc_session_header: str = Field(default="X-PQC-Session-Key", env="PQC_SESSION_HEADER")

    # Observability
    loki_url: str = Field(default="http://medtrust-loki:3100/loki/api/v1/push", env="LOKI_URL")
    otel_exporter_otlp_endpoint: str = Field(default="http://medtrust-jaeger:4317", env="OTEL_EXPORTER_OTLP_ENDPOINT")
    
    cors_origins: List[str] = ["*"]

settings = Settings()
