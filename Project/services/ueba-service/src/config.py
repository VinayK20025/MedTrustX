import os

class Config:
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://medtrust_ops_admin:ops_db_secret_2026@localhost:5433/ueba_db")
    REDIS_URL = os.getenv("REDIS_URL", "redis://:redis_secret_2026@localhost:6379")
    KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:19092")
    SERVICE_NAME = "ueba-service"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

config = Config()
