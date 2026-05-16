#!/bin/bash

# ==============================================================================
# MedTrustX DHOS Simulation - Configuration
# ==============================================================================

# Database connections
CLINICAL_DB="postgresql://medtrust_clinical_admin:clinical_db_secret_2026@localhost:5432/patients_db"
OPERATIONAL_DB="postgresql://medtrust_ops_admin:operational_db_secret_2026@localhost:5433/scheduling_db"
IAM_DB="postgresql://medtrust_iam_admin:iam_db_secret_2026@localhost:5434/iam_db"
ANALYTICS_DB="postgresql://medtrust_analytics_admin:analytics_db_secret_2026@localhost:5435/analytics_db"

# Service URLs (live mode)
ZTA_SERVICE="http://localhost:5002"
IAM_SERVICE="http://localhost:5001"
AI_SERVICE="http://localhost:3011"
AUDIT_SERVICE="http://localhost:4016"
COMPLIANCE_SERVICE="http://localhost:4015"
GATEWAY="http://localhost:4001"
PATIENT_SERVICE="http://localhost:3001"
CLINICAL_SERVICE="http://localhost:3002"
APPOINTMENT_SERVICE="http://localhost:4002"
FRONTEND="http://localhost:3000"
OPA_SERVICE="http://localhost:8181"
KEYCLOAK="http://localhost:8080"

# Redis
REDIS_CLI="redis-cli -h localhost -p 6379 -a redis_secret_2026"

# Simulation timing
TYPEWRITER_DELAY=0.03    # seconds per character
STEP_DELAY=0.5           # pause between steps
SCENE_DELAY=1.0          # pause before ENTER prompt

# Mode detection
LIVE_MODE=false          # auto-detected in run.sh

# Export for use in other scripts
export CLINICAL_DB OPERATIONAL_DB IAM_DB ANALYTICS_DB
export ZTA_SERVICE IAM_SERVICE AI_SERVICE AUDIT_SERVICE COMPLIANCE_SERVICE GATEWAY
export REDIS_CLI
export TYPEWRITER_DELAY STEP_DELAY SCENE_DELAY
export LIVE_MODE
