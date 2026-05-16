#!/bin/bash
set -e

echo "Bootstrapping Gateway Operational DB..."
docker exec -i pg-operational psql -U postgres -d scheduling_db <<EOF

CREATE TABLE IF NOT EXISTS api_request_logs (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(100),
    tenant_id VARCHAR(50),
    source_ip VARCHAR(50),
    method VARCHAR(10),
    path TEXT,
    status_code INT,
    duration_ms FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS threat_logs (
    id SERIAL PRIMARY KEY,
    threat_type VARCHAR(50),
    source_ip VARCHAR(50),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

EOF
echo "Gateway Operational DB configured."
