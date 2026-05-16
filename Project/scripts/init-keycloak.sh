#!/bin/bash
# MedTrustX — Initialize Keycloak Realm
# Imports the realm-export.json into Keycloak

set -e

echo "🚀 Initializing Keycloak..."

# Wait for Keycloak to be ready
until curl -s http://localhost:8080/health/ready > /dev/null; do
  echo "Waiting for Keycloak..."
  sleep 5
done

# Authenticate with kcadm
docker compose exec -T keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password keycloak_admin_2026

# Import Realm
docker compose exec -T keycloak /opt/keycloak/bin/kcadm.sh create partialImport -r master -s ifResourceExists=SKIP -o -f /tmp/realm-export.json

echo "✅ Keycloak initialized."
