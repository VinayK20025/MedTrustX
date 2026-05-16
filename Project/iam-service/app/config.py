from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    iam_service_port: int = 8013
    iam_service_workers: int = 4
    
    iam_db_url: str
    redis_url: str
    
    keycloak_url: str
    keycloak_realm: str
    keycloak_admin_user: str
    keycloak_admin_pass: str
    
    zta_service_url: str
    
    otel_exporter_otlp_endpoint: str
    otel_service_name: str = "iam-service"
    
    pqc_session_header: str = "X-PQC-Session-Key"
    rp_id: str = "medtrustx.internal"
    rp_name: str = "MedTrustX DHOS"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
