#!/bin/bash
# MedTrustX — Generate mTLS Certificates using step-ca
# Generates certificates for internal microservice communication

set -e

echo "🚀 Generating mTLS Certificates..."

CERT_DIR="./volumes/certs"
mkdir -p "$CERT_DIR"

export STEPPATH="$CERT_DIR"
STEP_CA_URL="https://localhost:9000"
FINGERPRINT=$(docker compose exec -T step-ca step certificate fingerprint certs/root_ca.crt | tr -d '\r')

# Generate certs for services
SERVICES=( "kong" "patient-service" "clinical-service" "gateway-service" "telemedicine-service" )

for SVC in "${SERVICES[@]}"; do
    echo "Generating cert for $SVC..."
    docker compose exec -T step-ca step ca certificate "$SVC.medtrust.local" "/home/step/$SVC.crt" "/home/step/$SVC.key" \
        --provisioner admin \
        --provisioner-password-file /home/step/password.txt \
        --ca-url https://localhost:9000 \
        --root /home/step/certs/root_ca.crt \
        --san "$SVC" \
        --not-after 8760h || echo "Failed to generate for $SVC, moving on..."
    
    # Copy certs out of the step-ca container to the local volume dir
    docker compose cp step-ca:/home/step/$SVC.crt "$CERT_DIR/$SVC.crt"
    docker compose cp step-ca:/home/step/$SVC.key "$CERT_DIR/$SVC.key"
done

echo "✅ Certificates generated in $CERT_DIR"
