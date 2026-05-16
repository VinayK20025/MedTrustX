#!/bin/bash
# MedTrustX — Initialize Vault
# Configures HashiCorp Vault secrets engine for dev

set -e

echo "🚀 Initializing Vault..."

export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='medtrust-vault-dev-token-2026'

# Enable KV v2 secrets engine at /secret
docker compose exec -e VAULT_ADDR=$VAULT_ADDR -e VAULT_TOKEN=$VAULT_TOKEN -T vault vault secrets enable -path=secret kv-v2 || true

# Write some dummy secrets for services
docker compose exec -e VAULT_ADDR=$VAULT_ADDR -e VAULT_TOKEN=$VAULT_TOKEN -T vault vault kv put secret/patient-service db_password=patient_svc_secret api_key=dummy_key
docker compose exec -e VAULT_ADDR=$VAULT_ADDR -e VAULT_TOKEN=$VAULT_TOKEN -T vault vault kv put secret/clinical-service db_password=clinical_svc_secret

echo "✅ Vault initialized."
