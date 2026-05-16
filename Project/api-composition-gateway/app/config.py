"""
API Composition Gateway Configuration.
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    api_composition_gateway_port: int = 8022
    api_composition_gateway_workers: int = 4
    
    operational_db_url: str
    redis_url: str
    
    keycloak_url: str
    keycloak_realm: str
    keycloak_client_id: str = "gateway-client"
    keycloak_client_secret: str = "secret"
    
    opa_url: str = "http://opa-service:8181"
    
    otel_exporter_otlp_endpoint: str
    otel_service_name: str = "api-composition-gateway"
    
    pqc_session_header: str = "X-PQC-Session-Key"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
