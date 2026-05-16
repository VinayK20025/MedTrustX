"""
Kong Config Service Configuration.
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    kong_config_service_port: int = 8021
    kong_config_service_workers: int = 2
    
    kong_admin_url: str = "http://kong-gateway-service:8001"
    
    operational_db_url: str
    redis_url: str
    
    keycloak_url: str
    keycloak_realm: str
    
    otel_exporter_otlp_endpoint: str
    otel_service_name: str = "kong-config-service"
    
    pqc_session_header: str = "X-PQC-Session-Key"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
