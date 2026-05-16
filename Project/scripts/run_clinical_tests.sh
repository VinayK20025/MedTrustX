#!/bin/bash
set -e

echo "Running Clinical Core Tests..."

export CLINICAL_DB_URL="sqlite+aiosqlite:///:memory:"
export ANALYTICS_DB_URL="sqlite+aiosqlite:///:memory:"
export OPERATIONAL_DB_URL="sqlite+aiosqlite:///:memory:"
export REDIS_URL="redis://localhost:6379/0"
export KEYCLOAK_URL="http://localhost:8080"
export KEYCLOAK_REALM="medtrustx"
export AUDIT_SERVICE_URL="http://localhost:8015"
export PATIENT_SERVICE_URL="http://localhost:8018"
export AI_SERVICE_URL="http://localhost:8010"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4317"

cd patient-service
export PYTHONPATH=$(pwd)
pytest ../tests/test_patient_service.py -v
cd ..

cd appointment-service
export PYTHONPATH=$(pwd)
pytest ../tests/test_clinical_appointments.py -v
cd ..

cd clinical-service
export PYTHONPATH=$(pwd)
pytest ../tests/test_cds_engine.py -v
pytest ../tests/test_vitals_processor.py -v
cd ..

echo "All Clinical tests passed successfully!"
