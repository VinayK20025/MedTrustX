-- MedTrustX — Telemedicine PostgreSQL Init Script
-- Instance: pg-telemed (port 5436)
-- Databases: telemedicine_db, notification_db

\set ON_ERROR_STOP on

SELECT 'CREATE DATABASE notification_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'notification_db')\gexec

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'telemed_svc') THEN CREATE ROLE telemed_svc LOGIN PASSWORD 'telemed_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'notification_svc') THEN CREATE ROLE notification_svc LOGIN PASSWORD 'notification_svc_secret'; END IF;
END $$;

GRANT CONNECT ON DATABASE telemedicine_db TO telemed_svc;
GRANT CONNECT ON DATABASE notification_db TO notification_svc;

\c telemedicine_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION set_tenant_id() RETURNS TRIGGER AS $$
BEGIN NEW.tenant_id := current_setting('app.tenant_id', true); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS teleconsult_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(64) NOT NULL,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  session_type VARCHAR(32) DEFAULT 'video',
  status VARCHAR(32) DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  recording_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE teleconsult_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON teleconsult_sessions
  USING (tenant_id = current_setting('app.tenant_id', true));

GRANT USAGE ON SCHEMA public TO telemed_svc;
GRANT ALL ON ALL TABLES IN SCHEMA public TO telemed_svc;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO telemed_svc;

\c notification_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT USAGE ON SCHEMA public TO notification_svc;
GRANT ALL ON ALL TABLES IN SCHEMA public TO notification_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO notification_svc;
