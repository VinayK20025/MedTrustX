from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    zta_service_port: int = 8012
    zta_service_workers: int = 4
    
    iam_db_url: str
    redis_url: str
    
    keycloak_url: str
    keycloak_realm: str
    
    opa_url: str
    opa_policy_path: str = "/v1/data/medtrust/authz/allow"
    
    otel_exporter_otlp_endpoint: str
    otel_service_name: str = "zta-service"
    
    pqc_session_header: str = "X-PQC-Session-Key"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
