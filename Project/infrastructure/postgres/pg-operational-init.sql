-- MedTrustX — Operational PostgreSQL Init Script
-- Instance: pg-operational (port 5433)
-- Databases: scheduling_db, billing_db, inventory_db, pharmacy_db,
--            hr_db, facilities_db, bed_mgmt_db, er_db, order_db,
--            marketing_db, transplant_db

\set ON_ERROR_STOP on

-- Create databases
SELECT 'CREATE DATABASE billing_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'billing_db')\gexec
SELECT 'CREATE DATABASE inventory_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'inventory_db')\gexec
SELECT 'CREATE DATABASE pharmacy_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'pharmacy_db')\gexec
SELECT 'CREATE DATABASE hr_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hr_db')\gexec
SELECT 'CREATE DATABASE facilities_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'facilities_db')\gexec
SELECT 'CREATE DATABASE bed_mgmt_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bed_mgmt_db')\gexec
SELECT 'CREATE DATABASE er_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'er_db')\gexec
SELECT 'CREATE DATABASE order_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'order_db')\gexec
SELECT 'CREATE DATABASE marketing_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'marketing_db')\gexec
SELECT 'CREATE DATABASE transplant_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'transplant_db')\gexec

-- Create service users
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'appointment_svc') THEN CREATE ROLE appointment_svc LOGIN PASSWORD 'appointment_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'billing_svc') THEN CREATE ROLE billing_svc LOGIN PASSWORD 'billing_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'inventory_svc') THEN CREATE ROLE inventory_svc LOGIN PASSWORD 'inventory_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'pharmacy_svc') THEN CREATE ROLE pharmacy_svc LOGIN PASSWORD 'pharmacy_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'hr_svc') THEN CREATE ROLE hr_svc LOGIN PASSWORD 'hr_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'facilities_svc') THEN CREATE ROLE facilities_svc LOGIN PASSWORD 'facilities_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bed_mgmt_svc') THEN CREATE ROLE bed_mgmt_svc LOGIN PASSWORD 'bed_mgmt_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'er_svc') THEN CREATE ROLE er_svc LOGIN PASSWORD 'er_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'order_svc') THEN CREATE ROLE order_svc LOGIN PASSWORD 'order_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'marketing_svc') THEN CREATE ROLE marketing_svc LOGIN PASSWORD 'marketing_svc_secret'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'transplant_svc') THEN CREATE ROLE transplant_svc LOGIN PASSWORD 'transplant_svc_secret'; END IF;
END $$;

-- Grant connect
GRANT CONNECT ON DATABASE scheduling_db TO appointment_svc;
GRANT CONNECT ON DATABASE billing_db TO billing_svc;
GRANT CONNECT ON DATABASE inventory_db TO inventory_svc;
GRANT CONNECT ON DATABASE pharmacy_db TO pharmacy_svc;
GRANT CONNECT ON DATABASE hr_db TO hr_svc;
GRANT CONNECT ON DATABASE facilities_db TO facilities_svc;
GRANT CONNECT ON DATABASE bed_mgmt_db TO bed_mgmt_svc;
GRANT CONNECT ON DATABASE er_db TO er_svc;
GRANT CONNECT ON DATABASE order_db TO order_svc;
GRANT CONNECT ON DATABASE marketing_db TO marketing_svc;
GRANT CONNECT ON DATABASE transplant_db TO transplant_svc;

-- Setup scheduling_db with RLS example
\c scheduling_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION set_tenant_id() RETURNS TRIGGER AS $$
BEGIN
  NEW.tenant_id := current_setting('app.tenant_id', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id VARCHAR(64) NOT NULL,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  department VARCHAR(128),
  appointment_type VARCHAR(64) NOT NULL,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  status VARCHAR(32) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_tenant ON appointments(tenant_id);
CREATE INDEX idx_appointments_patient ON appointments(tenant_id, patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(tenant_id, doctor_id);
CREATE INDEX idx_appointments_schedule ON appointments(tenant_id, scheduled_start);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON appointments
  USING (tenant_id = current_setting('app.tenant_id', true))
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true));
CREATE TRIGGER set_appointments_tenant BEFORE INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id();

GRANT USAGE ON SCHEMA public TO appointment_svc;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO appointment_svc;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO appointment_svc;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO appointment_svc;
