#!/bin/bash
# MedTrustX — Initialize Databases
# Runs PG init scripts if not automatically handled by Docker entrypoint

set -e

echo "🚀 Initializing MedTrustX Databases..."

# 1. Clinical
docker compose exec -T pg-clinical psql -U postgres -f /docker-entrypoint-initdb.d/pg-clinical-init.sql
# 2. Operational
docker compose exec -T pg-operational psql -U postgres -f /docker-entrypoint-initdb.d/pg-operational-init.sql
# 3. IAM
docker compose exec -T pg-iam psql -U postgres -f /docker-entrypoint-initdb.d/pg-iam-init.sql
# 4. Analytics
docker compose exec -T pg-analytics psql -U postgres -f /docker-entrypoint-initdb.d/pg-analytics-init.sql
# 5. Telemed
docker compose exec -T pg-telemed psql -U postgres -f /docker-entrypoint-initdb.d/pg-telemed-init.sql

echo "✅ Database initialization complete."
