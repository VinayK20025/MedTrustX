"""
Audit Service Configuration.
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    audit_service_port: int = 8015
    audit_service_workers: int = 4
    
    clinical_db_url: str
    operational_db_url: str
    redis_url: str
    
    keycloak_url: str
    keycloak_realm: str
    
    otel_exporter_otlp_endpoint: str
    otel_service_name: str = "audit-service"
    
    pqc_session_header: str = "X-PQC-Session-Key"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
