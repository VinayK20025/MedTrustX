-- MedTrustX — Analytics PostgreSQL Init Script
-- Instance: pg-analytics (port 5435)
-- Databases: analytics_db, management_db, devices_db, mlflow_db

\set ON_ERROR_STOP on

SELECT 'CREATE DATABASE management_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'management_db')\gexec
SELECT 'CREATE DATABASE devices_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'devices_db')\gexec
SELECT 'CREATE DATABASE mlflow_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mlflow_db')\gexec

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'analytics_svc') THEN CREATE ROLE analytics_svc LOGIN PASSWORD 'analytics_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'management_svc') THEN CREATE ROLE management_svc LOGIN PASSWORD 'management_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'devices_svc') THEN CREATE ROLE devices_svc LOGIN PASSWORD 'devices_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'ai_svc') THEN CREATE ROLE ai_svc LOGIN PASSWORD 'ai_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'mlflow_user') THEN CREATE ROLE mlflow_user LOGIN PASSWORD 'mlflow_secret_2026'; END IF;
END $$;

GRANT CONNECT ON DATABASE analytics_db TO analytics_svc, ai_svc;
GRANT CONNECT ON DATABASE management_db TO management_svc;
GRANT CONNECT ON DATABASE devices_db TO devices_svc;
GRANT CONNECT ON DATABASE mlflow_db TO mlflow_user;
ALTER DATABASE mlflow_db OWNER TO mlflow_user;

\c analytics_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT USAGE ON SCHEMA public TO analytics_svc, ai_svc;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO analytics_svc, ai_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO analytics_svc;

\c devices_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION set_tenant_id() RETURNS TRIGGER AS $$
BEGIN NEW.tenant_id := current_setting('app.tenant_id', true); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS iomt_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(64) NOT NULL,
  device_type VARCHAR(64) NOT NULL,
  manufacturer VARCHAR(128),
  model VARCHAR(128),
  serial_number VARCHAR(128),
  firmware_version VARCHAR(64),
  trust_score DECIMAL(5,2) DEFAULT 0.0,
  status VARCHAR(32) DEFAULT 'registered',
  last_seen TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE iomt_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON iomt_devices
  USING (tenant_id = current_setting('app.tenant_id', true));

GRANT USAGE ON SCHEMA public TO devices_svc;
GRANT ALL ON ALL TABLES IN SCHEMA public TO devices_svc;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO devices_svc;
