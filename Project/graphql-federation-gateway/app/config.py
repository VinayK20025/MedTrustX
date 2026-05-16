"""
GraphQL Federation Gateway Configuration.
"""
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    graphql_gateway_port: int = 8023
    graphql_gateway_workers: int = 4
    
    redis_url: str
    
    keycloak_url: str
    keycloak_realm: str
    keycloak_client_id: str = "graphql-gateway-client"
    keycloak_client_secret: str = "secret"
    
    composition_gateway_url: str = "http://api-composition-gateway:8022"
    
    otel_exporter_otlp_endpoint: str
    otel_service_name: str = "graphql-federation-gateway"
    
    pqc_session_header: str = "X-PQC-Session-Key"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
