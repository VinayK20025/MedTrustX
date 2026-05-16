from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    pam_service_port: int = 8014
    pam_service_workers: int = 4
    
    iam_db_url: str
    redis_url: str
    
    keycloak_url: str
    keycloak_realm: str
    
    zta_service_url: str
    iam_service_url: str
    
    otel_exporter_otlp_endpoint: str
    otel_service_name: str = "pam-service"
    
    pqc_session_header: str = "X-PQC-Session-Key"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
