#!/bin/bash
set -e

echo "Running Gateway tests..."

export KONG_ADMIN_URL="http://localhost:8001"
export OPERATIONAL_DB_URL="sqlite+aiosqlite:///:memory:"
export REDIS_URL="redis://localhost:6379/0"
export KEYCLOAK_URL="http://localhost:8080"
export KEYCLOAK_REALM="medtrustx"
export OPA_URL="http://localhost:8181"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4317"

pytest tests/test_kong_config.py -v
pytest tests/test_api_composition.py -v
pytest tests/test_graphql_federation.py -v
pytest tests/test_circuit_breaker.py -v
pytest tests/test_threat_intelligence.py -v
pytest tests/test_triple_auth.py -v

echo "Gateway tests completed successfully!"
